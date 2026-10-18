import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

# DTOs
create_file('src/application/accounting/dtos/FinancialRatiosDTO.ts', """export interface FinancialRatiosDTO {
    id: string;
    organizationId: string;
    balanceSheetId: string;
    incomeStatementId: string;
    cashFlowStatementId: string | null;
    periodEndDate: string;
    status: 'DRAFT' | 'PUBLISHED';
    generatedAt: string;
    results: {
        id: string;
        category: string;
        name: string;
        value: number | null;
        benchmark: number | null;
        status: string;
    }[];
}

export interface GenerateFinancialRatiosDTO {
    organizationId: string;
    balanceSheetId: string;
    incomeStatementId: string;
    cashFlowStatementId?: string;
    periodEndDate: string;
}
""")

# Ports
create_file('src/application/accounting/ports/IFinancialRatiosRepository.ts', """import { FinancialRatios } from '../../../domain/accounting/aggregates/FinancialRatios';
import { FinancialRatiosId } from '../../../domain/accounting/valueobjects/FinancialRatiosId';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';

export interface IFinancialRatiosRepository {
    save(ratios: FinancialRatios): Promise<void>;
    findById(organizationId: OrganizationId, id: FinancialRatiosId): Promise<FinancialRatios | null>;
    findByOrganizationId(organizationId: OrganizationId): Promise<FinancialRatios[]>;
}
""")

create_file('src/application/accounting/ports/IFinancialRatiosExporter.ts', """import { FinancialRatios } from '../../../domain/accounting/aggregates/FinancialRatios';

export interface IFinancialRatiosExporter {
    exportToPDF(ratios: FinancialRatios): Promise<Buffer>;
    exportToCSV(ratios: FinancialRatios): Promise<Buffer>;
}
""")

# Use Cases
create_file('src/application/accounting/usecases/FinancialRatiosUseCases.ts', """import { IFinancialRatiosRepository } from '../ports/IFinancialRatiosRepository';
import { IBalanceSheetRepository } from '../ports/IBalanceSheetRepository';
import { IIncomeStatementRepository } from '../ports/IIncomeStatementRepository';
import { ICashFlowRepository } from '../ports/ICashFlowRepository';
import { IFinancialValidationRepository } from '../ports/IFinancialValidationRepository';
import { IEventDispatcher } from '../../../domain/shared/core/IEventDispatcher';
import { FinancialRatiosDTO, GenerateFinancialRatiosDTO } from '../dtos/FinancialRatiosDTO';
import { FinancialRatios } from '../../../domain/accounting/aggregates/FinancialRatios';
import { FinancialRatiosId } from '../../../domain/accounting/valueobjects/FinancialRatiosId';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { BalanceSheetId } from '../../../domain/accounting/valueobjects/BalanceSheetId';
import { IncomeStatementId } from '../../../domain/accounting/valueobjects/IncomeStatementId';
import { CashFlowStatementId } from '../../../domain/accounting/valueobjects/CashFlowStatementId';
import { BusinessRuleError } from '../../../domain/shared/errors/BusinessRuleError';
import { RatioResult } from '../../../domain/accounting/entities/RatioResult';
import { RatioId } from '../../../domain/accounting/valueobjects/RatioId';
import { RatioName } from '../../../domain/accounting/valueobjects/RatioName';
import { RatioValue } from '../../../domain/accounting/valueobjects/RatioValue';
import { RatioBenchmark } from '../../../domain/accounting/valueobjects/RatioBenchmark';
import { RatioStatus } from '../../../domain/accounting/valueobjects/RatioStatus';
import { EntityId } from '../../../domain/shared/valueobjects/EntityId';
import * as crypto from 'crypto';

export class FinancialRatiosUseCases {
    constructor(
        private readonly repository: IFinancialRatiosRepository,
        private readonly balanceSheetRepo: IBalanceSheetRepository,
        private readonly incomeStatementRepo: IIncomeStatementRepository,
        private readonly cashFlowRepo: ICashFlowRepository,
        private readonly financialValidationRepo: IFinancialValidationRepository,
        private readonly eventDispatcher: IEventDispatcher
    ) {}

    public async generateFinancialRatios(dto: GenerateFinancialRatiosDTO): Promise<FinancialRatiosDTO> {
        const orgId = new OrganizationId(dto.organizationId);
        const bsId = new BalanceSheetId(dto.balanceSheetId);
        const isId = new IncomeStatementId(dto.incomeStatementId);
        const cfId = dto.cashFlowStatementId ? new CashFlowStatementId(dto.cashFlowStatementId) : null;

        // Fetch source statements
        const balanceSheet = await this.balanceSheetRepo.findById(orgId, bsId);
        if (!balanceSheet) throw new BusinessRuleError('Balance Sheet not found');

        const incomeStatement = await this.incomeStatementRepo.findById(orgId, isId);
        if (!incomeStatement) throw new BusinessRuleError('Income Statement not found');

        let cashFlow = null;
        if (cfId) {
            cashFlow = await this.cashFlowRepo.findById(orgId, cfId);
            if (!cashFlow) throw new BusinessRuleError('Cash Flow Statement not found');
        }

        // Validate that no critical financial validation errors exist for the period
        const validations = await this.financialValidationRepo.findByOrganizationId(orgId);
        const relevantValidations = validations.filter(v => 
            v.period.endDate.toISOString() === balanceSheet.period.endDate.toISOString()
        );
        
        if (relevantValidations.some(v => v.status === 'FAILED')) {
            throw new BusinessRuleError('Cannot generate financial ratios: underlying financial data has validation errors.');
        }

        const results: RatioResult[] = [];
        
        const totals = balanceSheet.calculateTotals();
        const currentAssets = totals.totalCurrentAssets.value;
        const currentLiabilities = totals.totalCurrentLiabilities.value;
        
        const isTotals = incomeStatement.calculateTotals();
        const grossProfit = isTotals.grossProfit.value;
        const revenue = isTotals.totalRevenue.value;
        const netIncome = isTotals.netIncome.value;
        const operatingIncome = isTotals.operatingIncome.value;

        // Liquidity
        const currentRatioVal = currentLiabilities !== 0 ? currentAssets / currentLiabilities : null;
        results.push(RatioResult.create(
            new RatioId(crypto.randomUUID()),
            'LIQUIDITY',
            new RatioName('Current Ratio'),
            new RatioValue(currentRatioVal),
            new RatioBenchmark(1.5),
            this.evaluateStatus(currentRatioVal, 1.5, 'higher-is-better')
        ));

        // Profitability
        const grossMarginVal = revenue !== 0 ? grossProfit / revenue : null;
        results.push(RatioResult.create(
            new RatioId(crypto.randomUUID()),
            'PROFITABILITY',
            new RatioName('Gross Profit Margin'),
            new RatioValue(grossMarginVal),
            new RatioBenchmark(0.4),
            this.evaluateStatus(grossMarginVal, 0.4, 'higher-is-better')
        ));
        
        const operatingMarginVal = revenue !== 0 ? operatingIncome / revenue : null;
        results.push(RatioResult.create(
            new RatioId(crypto.randomUUID()),
            'PROFITABILITY',
            new RatioName('Operating Margin'),
            new RatioValue(operatingMarginVal),
            new RatioBenchmark(0.15),
            this.evaluateStatus(operatingMarginVal, 0.15, 'higher-is-better')
        ));
        
        const netMarginVal = revenue !== 0 ? netIncome / revenue : null;
        results.push(RatioResult.create(
            new RatioId(crypto.randomUUID()),
            'PROFITABILITY',
            new RatioName('Net Profit Margin'),
            new RatioValue(netMarginVal),
            new RatioBenchmark(0.1),
            this.evaluateStatus(netMarginVal, 0.1, 'higher-is-better')
        ));

        // Solvency
        const totalAssets = totals.totalAssets.value;
        const totalLiabilities = totals.totalLiabilities.value;
        const totalEquity = totals.totalEquity.value;
        
        const debtRatioVal = totalAssets !== 0 ? totalLiabilities / totalAssets : null;
        results.push(RatioResult.create(
            new RatioId(crypto.randomUUID()),
            'SOLVENCY',
            new RatioName('Debt Ratio'),
            new RatioValue(debtRatioVal),
            new RatioBenchmark(0.5),
            this.evaluateStatus(debtRatioVal, 0.5, 'lower-is-better')
        ));
        
        const debtToEquityVal = totalEquity !== 0 ? totalLiabilities / totalEquity : null;
        results.push(RatioResult.create(
            new RatioId(crypto.randomUUID()),
            'SOLVENCY',
            new RatioName('Debt to Equity Ratio'),
            new RatioValue(debtToEquityVal),
            new RatioBenchmark(1.0),
            this.evaluateStatus(debtToEquityVal, 1.0, 'lower-is-better')
        ));
        
        // Performance
        const roaVal = totalAssets !== 0 ? netIncome / totalAssets : null;
        results.push(RatioResult.create(
            new RatioId(crypto.randomUUID()),
            'PERFORMANCE',
            new RatioName('Return on Assets (ROA)'),
            new RatioValue(roaVal),
            new RatioBenchmark(0.05),
            this.evaluateStatus(roaVal, 0.05, 'higher-is-better')
        ));
        
        const roeVal = totalEquity !== 0 ? netIncome / totalEquity : null;
        results.push(RatioResult.create(
            new RatioId(crypto.randomUUID()),
            'PERFORMANCE',
            new RatioName('Return on Equity (ROE)'),
            new RatioValue(roeVal),
            new RatioBenchmark(0.15),
            this.evaluateStatus(roeVal, 0.15, 'higher-is-better')
        ));

        const ratios = FinancialRatios.generate(
            new FinancialRatiosId(crypto.randomUUID()),
            orgId,
            bsId,
            isId,
            cfId,
            balanceSheet.period.endDate,
            results
        );

        await this.repository.save(ratios);
        await this.eventDispatcher.dispatchAll(ratios.domainEvents);
        ratios.clearEvents();

        return this.mapToDTO(ratios);
    }

    public async getFinancialRatios(organizationId: string, id: string): Promise<FinancialRatiosDTO> {
        const ratios = await this.repository.findById(new OrganizationId(organizationId), new FinancialRatiosId(id));
        if (!ratios) throw new BusinessRuleError('Financial Ratios not found');
        return this.mapToDTO(ratios);
    }

    public async validateFinancialRatios(organizationId: string, id: string): Promise<FinancialRatiosDTO> {
        const ratios = await this.repository.findById(new OrganizationId(organizationId), new FinancialRatiosId(id));
        if (!ratios) throw new BusinessRuleError('Financial Ratios not found');
        
        ratios.validate();
        ratios.publish(); // Also publishes it
        
        await this.repository.save(ratios);
        await this.eventDispatcher.dispatchAll(ratios.domainEvents);
        ratios.clearEvents();
        
        return this.mapToDTO(ratios);
    }
    
    public async compareFinancialRatios(organizationId: string, id1: string, id2: string): Promise<any> {
        const r1 = await this.repository.findById(new OrganizationId(organizationId), new FinancialRatiosId(id1));
        const r2 = await this.repository.findById(new OrganizationId(organizationId), new FinancialRatiosId(id2));
        
        if (!r1 || !r2) throw new BusinessRuleError('One or both Financial Ratios not found');
        
        return {
            period1: this.mapToDTO(r1),
            period2: this.mapToDTO(r2),
            variances: r1.results.map(res1 => {
                const res2 = r2.results.find(r => r.name.value === res1.name.value);
                return {
                    name: res1.name.value,
                    val1: res1.value.value,
                    val2: res2?.value.value || null,
                    variance: (res1.value.value !== null && res2?.value.value != null) ? res1.value.value - res2.value.value : null
                };
            })
        };
    }

    private evaluateStatus(value: number | null, benchmark: number, rule: 'higher-is-better' | 'lower-is-better'): 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'UNKNOWN' {
        if (value === null) return 'UNKNOWN';
        if (rule === 'higher-is-better') {
            if (value >= benchmark) return 'HEALTHY';
            if (value >= benchmark * 0.8) return 'WARNING';
            return 'CRITICAL';
        } else {
            if (value <= benchmark) return 'HEALTHY';
            if (value <= benchmark * 1.2) return 'WARNING';
            return 'CRITICAL';
        }
    }

    private mapToDTO(ratios: FinancialRatios): FinancialRatiosDTO {
        return {
            id: ratios.id.value,
            organizationId: ratios.organizationId.value,
            balanceSheetId: ratios.balanceSheetId.value,
            incomeStatementId: ratios.incomeStatementId.value,
            cashFlowStatementId: ratios.cashFlowStatementId?.value || null,
            periodEndDate: ratios.periodEndDate.toISOString(),
            status: ratios.status,
            generatedAt: ratios.generatedAt.toISOString(),
            results: ratios.results.map(r => ({
                id: r.id.value,
                category: r.category,
                name: r.name.value,
                value: r.value.value,
                benchmark: r.benchmark.value,
                status: r.status
            }))
        };
    }
}
""")

print("Financial Ratios App Layer generated")
