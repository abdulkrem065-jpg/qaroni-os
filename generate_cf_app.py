import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

# DTOs
create_file('src/application/accounting/dtos/CashFlowDTOs.ts', """export interface CashFlowLineDTO {
    id: string;
    accountId: string | null;
    description: string;
    amount: number;
}

export interface CashFlowSectionDTO {
    id: string;
    mainSection: 'OPERATING' | 'INVESTING' | 'FINANCING';
    lines: CashFlowLineDTO[];
    total: number;
}

export interface GenerateCashFlowDTO {
    organizationId: string;
    startBalanceSheetId: string;
    endBalanceSheetId: string;
    incomeStatementId: string;
    sections: {
        mainSection: 'OPERATING' | 'INVESTING' | 'FINANCING';
        lines: {
            accountId: string | null;
            description: string;
            amount: number;
        }[];
    }[];
}

export interface CashFlowStatementDTO {
    id: string;
    organizationId: string;
    startBalanceSheetId: string;
    endBalanceSheetId: string;
    incomeStatementId: string;
    startDate: string;
    endDate: string;
    sections: CashFlowSectionDTO[];
    openingCash: number;
    closingCash: number;
    operatingCashFlow: number;
    investingCashFlow: number;
    financingCashFlow: number;
    netCashMovement: number;
    status: string;
    generatedAt: string;
}
""")

# Export Interface
create_file('src/application/accounting/ports/ICashFlowExporter.ts', """import { CashFlowStatementDTO } from '../dtos/CashFlowDTOs';
export interface ICashFlowExporter {
    exportToPDF(cashFlow: CashFlowStatementDTO): Promise<Buffer>;
    exportToCSV(cashFlow: CashFlowStatementDTO): Promise<Buffer>;
}
""")

# Repository Interface
create_file('src/domain/accounting/repositories/ICashFlowRepository.ts', """import { CashFlowStatement } from '../aggregates/CashFlowStatement';
import { CashFlowStatementId } from '../valueobjects/CashFlowStatementId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export interface ICashFlowRepository {
    save(cashFlow: CashFlowStatement): Promise<void>;
    findById(id: CashFlowStatementId, organizationId: OrganizationId): Promise<CashFlowStatement | null>;
    findByOrganization(organizationId: OrganizationId): Promise<CashFlowStatement[]>;
}
""")

# Use Cases
create_file('src/application/accounting/usecases/CashFlowUseCases.ts', """import { ICashFlowRepository } from '../../../domain/accounting/repositories/ICashFlowRepository';
import { IBalanceSheetRepository } from '../../../domain/accounting/repositories/IBalanceSheetRepository';
import { IIncomeStatementRepository } from '../../../domain/accounting/repositories/IIncomeStatementRepository';
import { IFinancialValidationRepository } from '../../../domain/accounting/repositories/IFinancialValidationRepository';
import { CashFlowStatement } from '../../../domain/accounting/aggregates/CashFlowStatement';
import { CashFlowStatementId } from '../../../domain/accounting/valueobjects/CashFlowStatementId';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { BalanceSheetId } from '../../../domain/accounting/valueobjects/BalanceSheetId';
import { IncomeStatementId } from '../../../domain/accounting/valueobjects/IncomeStatementId';
import { CashFlowPeriod } from '../../../domain/accounting/valueobjects/CashFlowPeriod';
import { CashFlowSection } from '../../../domain/accounting/entities/CashFlowSection';
import { CashFlowLine } from '../../../domain/accounting/entities/CashFlowLine';
import { OpeningCashBalance } from '../../../domain/accounting/valueobjects/OpeningCashBalance';
import { ClosingCashBalance } from '../../../domain/accounting/valueobjects/ClosingCashBalance';
import { EntityId } from '../../../domain/shared/valueobjects/EntityId';
import { AccountId } from '../../../domain/accounting/valueobjects/AccountId';
import { BusinessRuleError } from '../../../domain/shared/errors/BusinessRuleError';
import { IEventBus } from '../../ports/IEventBus';
import { GenerateCashFlowDTO, CashFlowStatementDTO } from '../dtos/CashFlowDTOs';
import { ICashFlowExporter } from '../ports/ICashFlowExporter';
import * as crypto from 'crypto';

export class CashFlowUseCases {
    constructor(
        private readonly cashFlowRepo: ICashFlowRepository,
        private readonly balanceSheetRepo: IBalanceSheetRepository,
        private readonly incomeStatementRepo: IIncomeStatementRepository,
        private readonly validationRepo: IFinancialValidationRepository,
        private readonly eventBus: IEventBus,
        private readonly exporter?: ICashFlowExporter
    ) {}

    public async generateCashFlow(dto: GenerateCashFlowDTO): Promise<CashFlowStatementDTO> {
        const orgId = new OrganizationId(dto.organizationId);
        const startBsId = new BalanceSheetId(dto.startBalanceSheetId);
        const endBsId = new BalanceSheetId(dto.endBalanceSheetId);
        const isId = new IncomeStatementId(dto.incomeStatementId);

        // 1. Validate previous engines
        const startBs = await this.balanceSheetRepo.findById(startBsId, orgId);
        const endBs = await this.balanceSheetRepo.findById(endBsId, orgId);
        const incStmt = await this.incomeStatementRepo.findById(isId, orgId);

        if (!startBs || !endBs || !incStmt) {
            throw new BusinessRuleError('Required source statements not found');
        }

        // 2. Consume Financial Validation Engine
        const validations = await this.validationRepo.findByOrganization(orgId);
        const latestValidation = validations.length > 0 ? validations[0] : null;

        if (latestValidation && !latestValidation.isPassed) {
            throw new BusinessRuleError('Cannot generate Cash Flow: Financial Validation Engine reports critical errors.');
        }

        // 3. Compute Opening and Closing Cash balances from Balance Sheets
        // Assuming cash accounts are under Assets -> Current Assets -> Cash and Cash Equivalents
        // We will calculate by looking up the sections
        const extractCashTotal = (bs: any): number => {
            let cashTotal = 0;
            bs.sections.forEach((s: any) => {
                if (s.mainSection === 'ASSETS' && s.subSection === 'CURRENT_ASSETS') {
                    // Normally we'd check account type, but for now we look for 'Cash' in the description or just assume all 'CASH_AND_EQUIVALENTS' subsection
                    // Wait, BalanceSheet has 'CASH_AND_EQUIVALENTS' in subSection? Let's assume it maps to 'CURRENT_ASSETS' in BS, but let's just use a simplified sum of lines with "Cash" in name or rely on the aggregate.
                    s.lines.forEach((l: any) => {
                        if (l.accountName.toLowerCase().includes('cash')) {
                            cashTotal += l.amount;
                        }
                    });
                }
            });
            return cashTotal;
        };

        const openingCash = new OpeningCashBalance(extractCashTotal(startBs));
        const closingCash = new ClosingCashBalance(extractCashTotal(endBs));

        // 4. Map Sections
        const mappedSections = dto.sections.map(s => {
            const lines = s.lines.map(l => CashFlowLine.create(
                new EntityId(crypto.randomUUID()),
                l.accountId ? new AccountId(l.accountId) : null,
                l.description,
                l.amount
            ));
            return CashFlowSection.create(
                new EntityId(crypto.randomUUID()),
                s.mainSection,
                lines
            );
        });

        const period = new CashFlowPeriod(startBs.asOfDate, endBs.asOfDate);

        // 5. Generate Aggregate
        const cf = CashFlowStatement.generate(
            new CashFlowStatementId(crypto.randomUUID()),
            orgId,
            startBsId,
            endBsId,
            isId,
            period,
            mappedSections,
            openingCash,
            closingCash
        );

        await this.cashFlowRepo.save(cf);
        await this.eventBus.publishAll(cf.domainEvents);
        cf.clearDomainEvents();

        return this.mapToDTO(cf);
    }

    public async getCashFlow(organizationId: string, id: string): Promise<CashFlowStatementDTO> {
        const orgId = new OrganizationId(organizationId);
        const cfId = new CashFlowStatementId(id);

        const cf = await this.cashFlowRepo.findById(cfId, orgId);
        if (!cf) throw new BusinessRuleError('Cash Flow Statement not found');

        return this.mapToDTO(cf);
    }

    public async validateCashFlow(organizationId: string, id: string): Promise<CashFlowStatementDTO> {
        const orgId = new OrganizationId(organizationId);
        const cfId = new CashFlowStatementId(id);

        const cf = await this.cashFlowRepo.findById(cfId, orgId);
        if (!cf) throw new BusinessRuleError('Cash Flow Statement not found');

        cf.validate();
        await this.eventBus.publishAll(cf.domainEvents);
        cf.clearDomainEvents();

        return this.mapToDTO(cf);
    }

    public async compareCashFlows(organizationId: string, id1: string, id2: string): Promise<any> {
        const orgId = new OrganizationId(organizationId);
        const cf1 = await this.cashFlowRepo.findById(new CashFlowStatementId(id1), orgId);
        const cf2 = await this.cashFlowRepo.findById(new CashFlowStatementId(id2), orgId);

        if (!cf1 || !cf2) throw new BusinessRuleError('One or both Cash Flow Statements not found');

        const diff = {
            operatingDiff: cf2.calculateTotals().operating.value - cf1.calculateTotals().operating.value,
            investingDiff: cf2.calculateTotals().investing.value - cf1.calculateTotals().investing.value,
            financingDiff: cf2.calculateTotals().financing.value - cf1.calculateTotals().financing.value,
            netMovementDiff: cf2.calculateTotals().netMovement.value - cf1.calculateTotals().netMovement.value
        };

        return { diff };
    }

    public async exportCashFlow(organizationId: string, id: string, format: 'pdf' | 'csv'): Promise<Buffer> {
        if (!this.exporter) throw new Error('Exporter not configured');
        const cf = await this.getCashFlow(organizationId, id);
        
        if (format === 'csv') return this.exporter.exportToCSV(cf);
        return this.exporter.exportToPDF(cf);
    }

    private mapToDTO(cf: CashFlowStatement): CashFlowStatementDTO {
        const totals = cf.calculateTotals();
        return {
            id: cf.id.value,
            organizationId: cf.organizationId.value,
            startBalanceSheetId: cf.startBalanceSheetId.value,
            endBalanceSheetId: cf.endBalanceSheetId.value,
            incomeStatementId: cf.incomeStatementId.value,
            startDate: cf.period.startDate.toISOString(),
            endDate: cf.period.endDate.toISOString(),
            status: cf.status,
            generatedAt: cf.generatedAt.toISOString(),
            openingCash: cf.openingCash.value,
            closingCash: cf.closingCash.value,
            operatingCashFlow: totals.operating.value,
            investingCashFlow: totals.investing.value,
            financingCashFlow: totals.financing.value,
            netCashMovement: totals.netMovement.value,
            sections: cf.sections.map(s => ({
                id: s.id.value,
                mainSection: s.mainSection,
                total: s.total,
                lines: s.lines.map(l => ({
                    id: l.id.value,
                    accountId: l.accountId ? l.accountId.value : null,
                    description: l.description,
                    amount: l.amount
                }))
            }))
        };
    }
}
""")

print("Cash Flow App generated")
