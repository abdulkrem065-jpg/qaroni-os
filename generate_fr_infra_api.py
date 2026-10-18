import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

# Repository
create_file('src/infrastructure/accounting/repositories/SupabaseFinancialRatiosRepository.ts', """import { IFinancialRatiosRepository } from '../../../application/accounting/ports/IFinancialRatiosRepository';
import { FinancialRatios } from '../../../domain/accounting/aggregates/FinancialRatios';
import { FinancialRatiosId } from '../../../domain/accounting/valueobjects/FinancialRatiosId';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { BalanceSheetId } from '../../../domain/accounting/valueobjects/BalanceSheetId';
import { IncomeStatementId } from '../../../domain/accounting/valueobjects/IncomeStatementId';
import { CashFlowStatementId } from '../../../domain/accounting/valueobjects/CashFlowStatementId';
import { RatioResult } from '../../../domain/accounting/entities/RatioResult';
import { RatioId } from '../../../domain/accounting/valueobjects/RatioId';
import { RatioName } from '../../../domain/accounting/valueobjects/RatioName';
import { RatioValue } from '../../../domain/accounting/valueobjects/RatioValue';
import { RatioBenchmark } from '../../../domain/accounting/valueobjects/RatioBenchmark';
import { RatioStatus } from '../../../domain/accounting/valueobjects/RatioStatus';
import { RatioCategory } from '../../../domain/accounting/valueobjects/RatioCategory';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseFinancialRatiosRepository implements IFinancialRatiosRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    public async save(ratios: FinancialRatios): Promise<void> {
        const { error: rError } = await this.supabase
            .from('accounting_financial_ratios')
            .upsert({
                id: ratios.id.value,
                organization_id: ratios.organizationId.value,
                balance_sheet_id: ratios.balanceSheetId.value,
                income_statement_id: ratios.incomeStatementId.value,
                cash_flow_statement_id: ratios.cashFlowStatementId?.value || null,
                period_end_date: ratios.periodEndDate.toISOString(),
                status: ratios.status,
                generated_at: ratios.generatedAt.toISOString()
            });
        
        if (rError) throw new Error(`Failed to save Financial Ratios: ${rError.message}`);

        // Save Results
        const resultsData = ratios.results.map(r => ({
            id: r.id.value,
            financial_ratios_id: ratios.id.value,
            category: r.category,
            name: r.name.value,
            value: r.value.value,
            benchmark: r.benchmark.value,
            status: r.status
        }));

        const { error: lError } = await this.supabase
            .from('accounting_ratio_results')
            .upsert(resultsData);

        if (lError) throw new Error(`Failed to save Ratio Results: ${lError.message}`);
    }

    public async findById(organizationId: OrganizationId, id: FinancialRatiosId): Promise<FinancialRatios | null> {
        const { data, error } = await this.supabase
            .from('accounting_financial_ratios')
            .select(`
                *,
                results:accounting_ratio_results(*)
            `)
            .eq('id', id.value)
            .eq('organization_id', organizationId.value)
            .single();

        if (error || !data) return null;
        return this.toDomain(data);
    }

    public async findByOrganizationId(organizationId: OrganizationId): Promise<FinancialRatios[]> {
        const { data, error } = await this.supabase
            .from('accounting_financial_ratios')
            .select(`
                *,
                results:accounting_ratio_results(*)
            `)
            .eq('organization_id', organizationId.value);

        if (error || !data) return [];
        return data.map(d => this.toDomain(d));
    }

    private toDomain(data: any): FinancialRatios {
        const results = data.results.map((r: any) => RatioResult.load(
            new RatioId(r.id),
            r.category as RatioCategory,
            new RatioName(r.name),
            new RatioValue(r.value),
            new RatioBenchmark(r.benchmark),
            r.status as RatioStatus
        ));

        return FinancialRatios.load(
            new FinancialRatiosId(data.id),
            new OrganizationId(data.organization_id),
            new BalanceSheetId(data.balance_sheet_id),
            new IncomeStatementId(data.income_statement_id),
            data.cash_flow_statement_id ? new CashFlowStatementId(data.cash_flow_statement_id) : null,
            new Date(data.period_end_date),
            results,
            data.status,
            new Date(data.generated_at)
        );
    }
}
""")

# Controller
create_file('src/api/modules/accounting/controllers/FinancialRatiosController.ts', """import { Request, Response } from 'express';
import { FinancialRatiosUseCases } from '../../../../application/accounting/usecases/FinancialRatiosUseCases';
import { BusinessRuleError } from '../../../../domain/shared/errors/BusinessRuleError';

export class FinancialRatiosController {
    constructor(private readonly useCases: FinancialRatiosUseCases) {
        this.generateRatios = this.generateRatios.bind(this);
        this.getRatios = this.getRatios.bind(this);
        this.validateRatios = this.validateRatios.bind(this);
        this.compareRatios = this.compareRatios.bind(this);
    }

    public async generateRatios(req: Request, res: Response): Promise<void> {
        try {
            const dto = {
                organizationId: req.params.organizationId,
                ...req.body
            };
            const result = await this.useCases.generateFinancialRatios(dto);
            res.status(201).json(result);
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(400).json({ error: error.message });
            else res.status(500).json({ error: error.message });
        }
    }

    public async getRatios(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.useCases.getFinancialRatios(req.params.organizationId, req.params.id);
            res.status(200).json(result);
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(404).json({ error: error.message });
            else res.status(500).json({ error: error.message });
        }
    }

    public async validateRatios(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.useCases.validateFinancialRatios(req.params.organizationId, req.params.id);
            res.status(200).json(result);
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(404).json({ error: error.message });
            else res.status(500).json({ error: error.message });
        }
    }

    public async compareRatios(req: Request, res: Response): Promise<void> {
        try {
            const { id1, id2 } = req.body;
            if (!id1 || !id2) {
                 res.status(400).json({ error: 'id1 and id2 are required' });
                 return;
            }
            const result = await this.useCases.compareFinancialRatios(req.params.organizationId, id1, id2);
            res.status(200).json(result);
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(400).json({ error: error.message });
            else res.status(500).json({ error: error.message });
        }
    }
}
""")

# Validation
create_file('src/api/modules/accounting/validation/FinancialRatiosValidation.ts', """import { Request, Response, NextFunction } from 'express';

export class FinancialRatiosValidation {
    public static validateGenerate(req: Request, res: Response, next: NextFunction): void {
        const { balanceSheetId, incomeStatementId } = req.body;
        const errors = [];

        if (!balanceSheetId) errors.push('balanceSheetId is required');
        if (!incomeStatementId) errors.push('incomeStatementId is required');

        if (errors.length > 0) {
            res.status(400).json({ error: 'Validation failed', details: errors });
            return;
        }
        next();
    }
}
""")

print("Financial Ratios Infra and API generated")
