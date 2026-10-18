import { IFiscalYearRepository } from '../ports/IFiscalYearRepository';
import { ITrialBalanceRepository } from '../../../domain/accounting/repositories/ITrialBalanceRepository';
import { IJournalRepository } from '../../../domain/accounting/repositories/IJournalRepository';
import { IEventBus } from '../../ports/IEventBus';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { FiscalYearId } from '../../../domain/accounting/valueobjects/FiscalYearId';
import { AccountingPeriodId } from '../../../domain/accounting/valueobjects/AccountingPeriodId';
import { TrialBalanceId } from '../../../domain/accounting/valueobjects/TrialBalanceId';
import { BusinessRuleError } from '../../../domain/shared/errors/BusinessRuleError';
import { PeriodLockManager } from '../../../domain/accounting/services/PeriodLockManager';
import { ReopeningAuthorizationEngine } from '../../../domain/accounting/services/ReopeningAuthorizationEngine';
import { YearEndClosingEngine } from '../../../domain/accounting/services/YearEndClosingEngine';
import { OpeningBalanceGenerator, OpeningBalanceLine } from '../../../domain/accounting/services/OpeningBalanceGenerator';
import { IAccountClassificationService } from '../../../domain/accounting/services/IAccountClassificationService';
import { Journal } from '../../../domain/accounting/aggregates/Journal';
import { JournalId } from '../../../domain/accounting/valueobjects/JournalId';
import { JournalNumber } from '../../../domain/accounting/valueobjects/JournalNumber';
import { JournalDescription } from '../../../domain/accounting/valueobjects/JournalDescription';
import { PostingDate } from '../../../domain/accounting/valueobjects/PostingDate';
import { AccountingDate } from '../../../domain/accounting/valueobjects/AccountingDate';
import { JournalStatus } from '../../../domain/accounting/valueobjects/JournalStatus';
import { JournalLine } from '../../../domain/accounting/entities/JournalLine';
import { JournalLineId } from '../../../domain/accounting/valueobjects/JournalLineId';
import { AccountId } from '../../../domain/accounting/valueobjects/AccountId';
import { DebitAmount } from '../../../domain/accounting/valueobjects/DebitAmount';
import { CreditAmount } from '../../../domain/accounting/valueobjects/CreditAmount';
import * as crypto from 'crypto';

export interface ExecuteOpeningBalancesDTO {
    organizationId: string;
    closedFiscalYearId: string;
    trialBalanceId: string;
    retainedEarningsAccountId: string;
    retainedEarningsAccountNumber: string;
    newFiscalYearStartDate: string;
}

export class AccountingCycleUseCases {
    constructor(
        private readonly fiscalYearRepo: IFiscalYearRepository,
        private readonly trialBalanceRepo: ITrialBalanceRepository,
        private readonly journalRepo: IJournalRepository,
        private readonly classificationService: IAccountClassificationService,
        private readonly eventBus: IEventBus
    ) {}

    public async lockPeriod(organizationId: string, fiscalYearId: string, periodId: string): Promise<void> {
        const orgId = new OrganizationId(organizationId);
        const fy = await this.fiscalYearRepo.findById(orgId, new FiscalYearId(fiscalYearId));
        if (!fy) throw new BusinessRuleError('Fiscal year not found');

        PeriodLockManager.lockPeriod(fy, new AccountingPeriodId(periodId));

        await this.fiscalYearRepo.save(fy);
        await this.publishEvents(fy);
    }

    public async initiateClosing(organizationId: string, fiscalYearId: string, periodId: string): Promise<void> {
        const orgId = new OrganizationId(organizationId);
        const fy = await this.fiscalYearRepo.findById(orgId, new FiscalYearId(fiscalYearId));
        if (!fy) throw new BusinessRuleError('Fiscal year not found');

        PeriodLockManager.initiateClosing(fy, new AccountingPeriodId(periodId));

        await this.fiscalYearRepo.save(fy);
        await this.publishEvents(fy);
    }

    public async authorizeAndReopenPeriod(organizationId: string, fiscalYearId: string, periodId: string, reason: string): Promise<void> {
        const orgId = new OrganizationId(organizationId);
        const fy = await this.fiscalYearRepo.findById(orgId, new FiscalYearId(fiscalYearId));
        if (!fy) throw new BusinessRuleError('Fiscal year not found');

        ReopeningAuthorizationEngine.authorizeAndReopenPeriod(fy, new AccountingPeriodId(periodId), reason);

        await this.fiscalYearRepo.save(fy);
        await this.publishEvents(fy);
    }

    public async closeYearEnd(organizationId: string, fiscalYearId: string, finalTrialBalanceId: string): Promise<void> {
        const orgId = new OrganizationId(organizationId);
        const fy = await this.fiscalYearRepo.findById(orgId, new FiscalYearId(fiscalYearId));
        if (!fy) throw new BusinessRuleError('Fiscal year not found');

        const tb = await this.trialBalanceRepo.findById(new TrialBalanceId(finalTrialBalanceId), orgId);
        if (!tb) throw new BusinessRuleError('Final Trial Balance not found');

        YearEndClosingEngine.closeYear(fy, tb);

        await this.fiscalYearRepo.save(fy);
        await this.publishEvents(fy);
    }

    public async executeOpeningBalances(dto: ExecuteOpeningBalancesDTO): Promise<{ openingJournalId: string }> {
        const orgId = new OrganizationId(dto.organizationId);
        const closedFy = await this.fiscalYearRepo.findById(orgId, new FiscalYearId(dto.closedFiscalYearId));
        if (!closedFy) throw new BusinessRuleError('Closed fiscal year not found');
        if (closedFy.status.value !== 'CLOSED') throw new BusinessRuleError('Cannot generate opening balances from an unclosed year');

        const tb = await this.trialBalanceRepo.findById(new TrialBalanceId(dto.trialBalanceId), orgId);
        if (!tb) throw new BusinessRuleError('Trial Balance not found');

        const generator = new OpeningBalanceGenerator(this.classificationService);
        const openingLines = generator.generateOpeningBalances(tb, dto.retainedEarningsAccountId, dto.retainedEarningsAccountNumber);

        const journalLines = openingLines.map((l, index) => JournalLine.create(
            new JournalLineId(crypto.randomUUID()),
            new AccountId(l.accountId),
            new JournalDescription(`Opening Balance - Line ${index + 1}`),
            new DebitAmount(l.debit),
            new CreditAmount(l.credit),
            'BASE_CURRENCY' // Assuming a default currency
        ));

        const startDate = new Date(dto.newFiscalYearStartDate);
        const journal = Journal.create(
            new JournalId(crypto.randomUUID()),
            orgId,
            new JournalNumber(`OPEN-${closedFy.year + 1}`),
            new JournalDescription(`Opening Balances for ${closedFy.year + 1}`),
            new PostingDate(startDate),
            new AccountingDate(startDate),
            undefined as any
        );

        for (const line of journalLines) {
            journal.addLine(line);
        }

        // Auto-approve opening journal
        journal.requestApproval();
        journal.approve();

        await this.journalRepo.save(journal);
        await this.publishEvents(journal);

        return { openingJournalId: journal.id.value };
    }

    private async publishEvents(aggregate: any): Promise<void> {
        for (const ev of aggregate.domainEvents) await this.eventBus.publish(ev);
        aggregate.clearDomainEvents();
    }
}
