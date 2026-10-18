import { IBalanceSheetRepository } from '../../../domain/accounting/repositories/IBalanceSheetRepository';
import { ITrialBalanceRepository } from '../../../domain/accounting/repositories/ITrialBalanceRepository';
import { IAccountClassificationService } from '../../../domain/accounting/services/IAccountClassificationService';
import { BalanceSheet } from '../../../domain/accounting/aggregates/BalanceSheet';
import { BalanceSheetId } from '../../../domain/accounting/valueobjects/BalanceSheetId';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { TrialBalanceId } from '../../../domain/accounting/valueobjects/TrialBalanceId';
import { BalanceSheetPeriod } from '../../../domain/accounting/valueobjects/BalanceSheetPeriod';
import { BalanceSheetSection } from '../../../domain/accounting/entities/BalanceSheetSection';
import { BalanceSheetLine } from '../../../domain/accounting/entities/BalanceSheetLine';
import { EntityId } from '../../../domain/shared/valueobjects/EntityId';
import { BusinessRuleError } from '../../../domain/shared/errors/BusinessRuleError';
import * as crypto from 'crypto';
import { GenerateBalanceSheetDTO, BalanceSheetDTO } from '../dtos/BalanceSheetDTOs';
import { IBalanceSheetExporter } from '../ports/IBalanceSheetExporter';
import { BalanceSheetMainSection, BalanceSheetSubSection } from '../../../domain/accounting/valueobjects/BalanceSheetClassification';

export class BalanceSheetUseCases {
    constructor(
        private readonly balanceSheetRepo: IBalanceSheetRepository,
        private readonly trialBalanceRepo: ITrialBalanceRepository,
        private readonly classificationService: IAccountClassificationService,
        private readonly exporter?: IBalanceSheetExporter // Optional since it's an interface only
    ) {}

    public async generateBalanceSheet(dto: GenerateBalanceSheetDTO): Promise<BalanceSheetDTO> {
        const orgId = new OrganizationId(dto.organizationId);
        const tbId = new TrialBalanceId(dto.trialBalanceId);

        // Consume ONLY Trial Balance Engine
        const trialBalance = await this.trialBalanceRepo.findById(tbId, orgId);
        if (!trialBalance) {
            throw new BusinessRuleError('Trial Balance not found');
        }
        
        trialBalance.validateBalance(); // Ensure it's balanced

        const period = new BalanceSheetPeriod(
            trialBalance.period.startDate,
            trialBalance.period.endDate
        );

        // Group lines by section and subsection
        const sectionMap = new Map<string, BalanceSheetLine[]>();

        for (const account of trialBalance.accounts) {
            // Determine balance amount based on normal balance
            // For DEBIT normal accounts (Assets), Amount = Debit - Credit
            // For CREDIT normal accounts (Liabilities, Equity), Amount = Credit - Debit
            const classInfo = this.classificationService.classify(account.accountNumber);
            let amount = 0;
            
            if (classInfo.normalBalance === 'DEBIT') {
                amount = account.balance.debit.value - account.balance.credit.value;
            } else {
                amount = account.balance.credit.value - account.balance.debit.value;
            }

            if (amount === 0) continue; // Skip zero balance accounts

            const line = BalanceSheetLine.create(
                new EntityId(crypto.randomUUID()),
                account.accountId,
                account.accountNumber,
                account.accountName,
                amount
            );

            const key = `${classInfo.mainSection}::${classInfo.subSection}`;
            if (!sectionMap.has(key)) {
                sectionMap.set(key, []);
            }
            sectionMap.get(key)!.push(line);
        }

        const sections: BalanceSheetSection[] = [];
        for (const [key, lines] of sectionMap.entries()) {
            const [main, sub] = key.split('::') as [BalanceSheetMainSection, BalanceSheetSubSection];
            sections.push(
                BalanceSheetSection.create(
                    new EntityId(crypto.randomUUID()),
                    main,
                    sub,
                    lines
                )
            );
        }

        // Aggregate validates accounting equation on generation (Assets = Liabilities + Equity)
        const balanceSheet = BalanceSheet.generate(
            new BalanceSheetId(crypto.randomUUID()),
            orgId,
            tbId,
            period,
            sections
        );

        await this.balanceSheetRepo.save(balanceSheet);

        return this.mapToDTO(balanceSheet);
    }

    public async getBalanceSheet(organizationId: string, id: string): Promise<BalanceSheetDTO> {
        const bs = await this.balanceSheetRepo.findById(
            new BalanceSheetId(id), 
            new OrganizationId(organizationId)
        );
        
        if (!bs) throw new BusinessRuleError('Balance Sheet not found');
        return this.mapToDTO(bs);
    }

    public async validateBalanceSheet(organizationId: string, id: string): Promise<{ isValid: boolean, message: string }> {
        const bs = await this.balanceSheetRepo.findById(
            new BalanceSheetId(id), 
            new OrganizationId(organizationId)
        );
        
        if (!bs) throw new BusinessRuleError('Balance Sheet not found');
        
        try {
            bs.validateAccountingEquation();
            return { isValid: true, message: 'Balance sheet is valid (Assets = Liabilities + Equity)' };
        } catch (e: any) {
            return { isValid: false, message: e.message };
        }
    }

    public async compareBalanceSheets(organizationId: string, id1: string, id2: string): Promise<any> {
        const bs1 = await this.getBalanceSheet(organizationId, id1);
        const bs2 = await this.getBalanceSheet(organizationId, id2);

        return {
            comparisonId: crypto.randomUUID(),
            bs1: bs1.id,
            bs2: bs2.id,
            differences: {
                assetsTotalDifference: Math.abs(bs1.assetsTotal - bs2.assetsTotal),
                liabilitiesTotalDifference: Math.abs(bs1.liabilitiesTotal - bs2.liabilitiesTotal),
                equityTotalDifference: Math.abs(bs1.equityTotal - bs2.equityTotal)
            }
        };
    }

    public async exportBalanceSheet(organizationId: string, id: string, format: 'pdf' | 'csv'): Promise<Buffer> {
        if (!this.exporter) {
            throw new Error('Export service not implemented');
        }

        const data = await this.getBalanceSheet(organizationId, id);
        
        if (format === 'csv') return this.exporter.exportToCsv(data);
        if (format === 'pdf') return this.exporter.exportToPdf(data);
        
        throw new BusinessRuleError('Invalid export format');
    }

    private mapToDTO(bs: BalanceSheet): BalanceSheetDTO {
        return {
            id: bs.id.value,
            organizationId: bs.organizationId.value,
            trialBalanceId: bs.trialBalanceId.value,
            startDate: bs.period.startDate.toISOString(),
            endDate: bs.period.endDate.toISOString(),
            status: bs.status.value,
            generatedAt: bs.generatedAt.toISOString(),
            assetsTotal: bs.calculateAssetTotal().value,
            liabilitiesTotal: bs.calculateLiabilityTotal().value,
            equityTotal: bs.calculateEquityTotal().value,
            sections: bs.sections.map(s => ({
                mainSection: s.mainSection,
                subSection: s.subSection,
                total: s.total,
                lines: s.lines.map(l => ({
                    accountId: l.accountId.value,
                    accountNumber: l.accountNumber,
                    accountName: l.accountName,
                    amount: l.amount
                }))
            }))
        };
    }
}
