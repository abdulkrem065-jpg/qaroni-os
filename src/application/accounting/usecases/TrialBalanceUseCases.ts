import { ITrialBalanceRepository } from '../../../domain/accounting/repositories/ITrialBalanceRepository';
import { ILedgerEntryQuery } from '../../../domain/accounting/repositories/ILedgerEntryQuery';
import { TrialBalance } from '../../../domain/accounting/aggregates/TrialBalance';
import { TrialBalanceId } from '../../../domain/accounting/valueobjects/TrialBalanceId';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { TrialBalancePeriod } from '../../../domain/accounting/valueobjects/TrialBalancePeriod';
import { TrialBalancePeriodType, PeriodType } from '../../../domain/accounting/valueobjects/TrialBalancePeriodType';
import { TrialBalanceAccount } from '../../../domain/accounting/entities/TrialBalanceAccount';
import { EntityId } from '../../../domain/shared/valueobjects/EntityId';
import { AccountId } from '../../../domain/accounting/valueobjects/AccountId';
import { BusinessRuleError } from '../../../domain/shared/errors/BusinessRuleError';
import * as crypto from 'crypto';
import { GenerateTrialBalanceDTO, TrialBalanceDTO } from '../dtos/TrialBalanceDTOs';
import { ITrialBalanceExporter } from '../ports/ITrialBalanceExporter';

export class TrialBalanceUseCases {
    constructor(
        private readonly trialBalanceRepo: ITrialBalanceRepository,
        private readonly ledgerQuery: ILedgerEntryQuery,
        private readonly exporter?: ITrialBalanceExporter // Optional since it's an interface only
    ) {}

    public async generateTrialBalance(dto: GenerateTrialBalanceDTO): Promise<TrialBalanceDTO> {
        const orgId = new OrganizationId(dto.organizationId);
        const periodType = new TrialBalancePeriodType(dto.periodType);
        const startDate = new Date(dto.startDate);
        const endDate = new Date(dto.endDate);
        
        const period = new TrialBalancePeriod(periodType, startDate, endDate);

        // Fetch balances directly from the General Ledger (ILedgerEntryQuery)
        // This ensures we ONLY consume General Ledger data, and only posted entries.
        const ledgerBalances = await this.ledgerQuery.calculateBalancesByDateRange(orgId, startDate, endDate);

        const accounts = ledgerBalances.map(lb => 
            TrialBalanceAccount.create(
                new EntityId(crypto.randomUUID()),
                new AccountId(lb.accountId),
                lb.totalDebit,
                lb.totalCredit,
                lb.accountNumber,
                lb.accountName
            )
        );

        // Aggregate validates equality of debits and credits on creation
        const trialBalance = TrialBalance.generate(
            new TrialBalanceId(crypto.randomUUID()),
            orgId,
            period,
            accounts
        );

        await this.trialBalanceRepo.save(trialBalance);

        return this.mapToDTO(trialBalance);
    }

    public async getTrialBalance(organizationId: string, id: string): Promise<TrialBalanceDTO> {
        const tb = await this.trialBalanceRepo.findById(
            new TrialBalanceId(id), 
            new OrganizationId(organizationId)
        );
        
        if (!tb) throw new BusinessRuleError('Trial Balance not found');
        return this.mapToDTO(tb);
    }

    public async validateTrialBalance(organizationId: string, id: string): Promise<{ isValid: boolean, message: string }> {
        const tb = await this.trialBalanceRepo.findById(
            new TrialBalanceId(id), 
            new OrganizationId(organizationId)
        );
        
        if (!tb) throw new BusinessRuleError('Trial Balance not found');
        
        try {
            tb.validateBalance();
            return { isValid: true, message: 'Trial balance is valid (Debits == Credits)' };
        } catch (e: any) {
            return { isValid: false, message: e.message };
        }
    }

    public async compareTrialBalances(organizationId: string, id1: string, id2: string): Promise<any> {
        const tb1 = await this.getTrialBalance(organizationId, id1);
        const tb2 = await this.getTrialBalance(organizationId, id2);

        // Simple comparison mapping for API response
        return {
            comparisonId: crypto.randomUUID(),
            tb1: tb1.id,
            tb2: tb2.id,
            differences: {
                totalDebitDifference: Math.abs(tb1.totalDebit - tb2.totalDebit),
                totalCreditDifference: Math.abs(tb1.totalCredit - tb2.totalCredit)
            }
        };
    }

    public async exportTrialBalance(organizationId: string, id: string, format: 'pdf' | 'csv'): Promise<Buffer> {
        if (!this.exporter) {
            throw new Error('Export service not implemented');
        }

        const data = await this.getTrialBalance(organizationId, id);
        
        if (format === 'csv') return this.exporter.exportToCsv(data);
        if (format === 'pdf') return this.exporter.exportToPdf(data);
        
        throw new BusinessRuleError('Invalid export format');
    }

    private mapToDTO(tb: TrialBalance): TrialBalanceDTO {
        return {
            id: tb.id.value,
            organizationId: tb.organizationId.value,
            periodType: tb.period.type.value,
            startDate: tb.period.startDate.toISOString(),
            endDate: tb.period.endDate.toISOString(),
            generatedAt: tb.generatedAt.toISOString(),
            totalDebit: tb.calculateTotalDebit().value,
            totalCredit: tb.calculateTotalCredit().value,
            accounts: tb.accounts.map(acc => ({
                accountId: acc.accountId.value,
                accountNumber: acc.accountNumber,
                accountName: acc.accountName,
                debit: acc.balance.debit.value,
                credit: acc.balance.credit.value
            }))
        };
    }
}
