import { IIncomeStatementRepository } from '../../../domain/accounting/repositories/IIncomeStatementRepository';
import { ITrialBalanceRepository } from '../../../domain/accounting/repositories/ITrialBalanceRepository';
import { IFinancialValidationRepository } from '../../../domain/accounting/repositories/IFinancialValidationRepository';
import { IIncomeStatementClassificationService, IncomeClassification } from '../../../domain/accounting/services/IIncomeStatementClassificationService';
import { IncomeStatement } from '../../../domain/accounting/aggregates/IncomeStatement';
import { IncomeStatementId } from '../../../domain/accounting/valueobjects/IncomeStatementId';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { TrialBalanceId } from '../../../domain/accounting/valueobjects/TrialBalanceId';
import { IncomeStatementPeriod } from '../../../domain/accounting/valueobjects/IncomeStatementPeriod';
import { IncomeStatementSection } from '../../../domain/accounting/entities/IncomeStatementSection';
import { IncomeStatementLine } from '../../../domain/accounting/entities/IncomeStatementLine';
import { EntityId } from '../../../domain/shared/valueobjects/EntityId';
import { AccountId } from '../../../domain/accounting/valueobjects/AccountId';
import { BusinessRuleError } from '../../../domain/shared/errors/BusinessRuleError';
import { IEventBus } from '../../ports/IEventBus';
import { GenerateIncomeStatementDTO, IncomeStatementDTO } from '../dtos/IncomeStatementDTOs';
import { IIncomeStatementExporter } from '../ports/IIncomeStatementExporter';
import * as crypto from 'crypto';

export class IncomeStatementUseCases {
    constructor(
        private readonly incomeStatementRepo: IIncomeStatementRepository,
        private readonly trialBalanceRepo: ITrialBalanceRepository,
        private readonly validationRepo: IFinancialValidationRepository,
        private readonly classificationService: IIncomeStatementClassificationService,
        private readonly eventBus: IEventBus,
        private readonly exporter?: IIncomeStatementExporter
    ) {}

    public async generateIncomeStatement(dto: GenerateIncomeStatementDTO): Promise<IncomeStatementDTO> {
        const orgId = new OrganizationId(dto.organizationId);
        const tbId = new TrialBalanceId(dto.trialBalanceId);

        // 1. Fetch Trial Balance
        const tb = await this.trialBalanceRepo.findById(tbId, orgId);
        if (!tb) throw new BusinessRuleError('Trial Balance not found');

        // 2. Consume Financial Validation Engine - Ensure previous validations passed
        // For strict compliance, we check if there's any recent CRITICAL/ERROR validation for this organization or TB
        const validations = await this.validationRepo.findByOrganization(orgId);
        const latestValidation = validations.length > 0 ? validations[0] : null;

        if (latestValidation) {
            if (!latestValidation.isPassed) {
                throw new BusinessRuleError('Cannot generate Income Statement: Financial Validation Engine reports critical errors.');
            }
        }

        // Also strictly validate the TB itself
        tb.validateBalance();

        // 3. Process lines using classification
        const sectionsMap = new Map<string, { classification: IncomeClassification, lines: IncomeStatementLine[] }>();

        for (const tbLine of tb.accounts) {
            const classification = this.classificationService.classify(tbLine.accountNumber);
            if (!classification) continue; // Skip non-income statement accounts (e.g. Assets, Liabilities)

            // Adjust amount based on normal balance. 
            // Revenue is normally Credit, Expenses are normally Debit.
            // For P&L, we usually represent Revenue as positive, Expenses as positive for reporting, but let's see.
            // Wait, for Gross Profit = Revenue - COGS. So Revenue should be positive, Expenses should be positive.
            let reportAmount = 0;
            if (classification.normalBalance === 'CREDIT') {
                reportAmount = tbLine.balance.credit.value - tbLine.balance.debit.value;
            } else {
                reportAmount = tbLine.balance.debit.value - tbLine.balance.credit.value;
            }

            // Exclude zero balance accounts
            if (Math.abs(reportAmount) < 0.001) continue;

            const sectionKey = `${classification.mainSection}_${classification.subSection}`;
            if (!sectionsMap.has(sectionKey)) {
                sectionsMap.set(sectionKey, { classification, lines: [] });
            }

            const isLine = IncomeStatementLine.create(
                new EntityId(crypto.randomUUID()),
                tbLine.accountId,
                tbLine.accountNumber,
                tbLine.accountName,
                reportAmount
            );

            sectionsMap.get(sectionKey)!.lines.push(isLine);
        }

        const sections: IncomeStatementSection[] = [];
        for (const [key, value] of Array.from(sectionsMap.entries())) {
            sections.push(IncomeStatementSection.create(
                new EntityId(crypto.randomUUID()),
                value.classification.mainSection,
                value.classification.subSection,
                value.lines
            ));
        }

        const is = IncomeStatement.generate(
            new IncomeStatementId(crypto.randomUUID()),
            orgId,
            tbId,
            new IncomeStatementPeriod(tb.period.endDate, tb.period.endDate), // Using TB date as period for simplicity
            sections
        );

        await this.incomeStatementRepo.save(is);
        await this.eventBus.publishAll(is.domainEvents);
        is.clearDomainEvents();

        return this.mapToDTO(is);
    }

    public async getIncomeStatement(organizationId: string, id: string): Promise<IncomeStatementDTO> {
        const orgId = new OrganizationId(organizationId);
        const isId = new IncomeStatementId(id);

        const is = await this.incomeStatementRepo.findById(isId, orgId);
        if (!is) throw new BusinessRuleError('Income Statement not found');

        return this.mapToDTO(is);
    }

    public async validateIncomeStatement(organizationId: string, id: string): Promise<IncomeStatementDTO> {
        const orgId = new OrganizationId(organizationId);
        const isId = new IncomeStatementId(id);

        const is = await this.incomeStatementRepo.findById(isId, orgId);
        if (!is) throw new BusinessRuleError('Income Statement not found');

        is.validate();
        await this.eventBus.publishAll(is.domainEvents);
        is.clearDomainEvents();

        return this.mapToDTO(is);
    }

    public async compareIncomeStatements(organizationId: string, id1: string, id2: string): Promise<any> {
        const orgId = new OrganizationId(organizationId);
        const is1 = await this.incomeStatementRepo.findById(new IncomeStatementId(id1), orgId);
        const is2 = await this.incomeStatementRepo.findById(new IncomeStatementId(id2), orgId);

        if (!is1 || !is2) throw new BusinessRuleError('One or both Income Statements not found');

        const diff = {
            revenueDiff: is2.calculateRevenueTotal().value - is1.calculateRevenueTotal().value,
            expenseDiff: is2.calculateExpenseTotal().value - is1.calculateExpenseTotal().value,
            netProfitDiff: is2.calculateNetProfit().value - is1.calculateNetProfit().value
        };

        return { diff };
    }

    public async exportIncomeStatement(organizationId: string, id: string, format: 'pdf' | 'csv'): Promise<Buffer> {
        if (!this.exporter) throw new Error('Exporter not configured');
        const is = await this.getIncomeStatement(organizationId, id);
        
        if (format === 'csv') return this.exporter.exportToCSV(is);
        return this.exporter.exportToPDF(is);
    }

    private mapToDTO(is: IncomeStatement): IncomeStatementDTO {
        return {
            id: is.id.value,
            organizationId: is.organizationId.value,
            trialBalanceId: is.trialBalanceId.value,
            startDate: is.period.startDate.toISOString(),
            endDate: is.period.endDate.toISOString(),
            status: is.status,
            generatedAt: is.generatedAt.toISOString(),
            revenueTotal: is.calculateRevenueTotal().value,
            expenseTotal: is.calculateExpenseTotal().value,
            grossProfit: is.calculateGrossProfit().value,
            operatingProfit: is.calculateOperatingProfit().value,
            netProfit: is.calculateNetProfit().value,
            sections: is.sections.map(s => ({
                id: s.id.value,
                mainSection: s.mainSection,
                subSection: s.subSection,
                total: s.total,
                lines: s.lines.map(l => ({
                    id: l.id.value,
                    accountId: l.accountId.value,
                    accountNumber: l.accountNumber,
                    accountName: l.accountName,
                    amount: l.amount
                }))
            }))
        };
    }
}
