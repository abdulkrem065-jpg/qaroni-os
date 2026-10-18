import { SupabaseClient } from '@supabase/supabase-js';
import { IFinancialValidationRepository } from '../../../domain/accounting/repositories/IFinancialValidationRepository';
import { FinancialValidation } from '../../../domain/accounting/aggregates/FinancialValidation';
import { ValidationId } from '../../../domain/accounting/valueobjects/ValidationId';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { ValidationCategory } from '../../../domain/accounting/valueobjects/ValidationCategory';
import { ValidationResult } from '../../../domain/accounting/entities/ValidationResult';
import { ValidationIssue } from '../../../domain/accounting/entities/ValidationIssue';
import { ValidationCode } from '../../../domain/accounting/valueobjects/ValidationCode';
import { ValidationSeverity } from '../../../domain/accounting/valueobjects/ValidationSeverity';
import { EntityId } from '../../../domain/shared/valueobjects/EntityId';

export class SupabaseFinancialValidationRepository implements IFinancialValidationRepository {
    private readonly table = 'accounting_financial_validations';

    constructor(private readonly supabase: SupabaseClient) {}

    public async save(validation: FinancialValidation): Promise<void> {
        const data = this.toPersistence(validation);
        
        const { error } = await this.supabase
            .from(this.table)
            .upsert(data, { onConflict: 'id, organization_id' });

        if (error) {
            throw new Error(`Failed to save validation: ${error.message}`);
        }
    }

    public async findById(id: ValidationId, organizationId: OrganizationId): Promise<FinancialValidation | null> {
        const { data, error } = await this.supabase
            .from(this.table)
            .select('*')
            .eq('id', id.value)
            .eq('organization_id', organizationId.value)
            .single();

        if (error || !data) return null;
        return this.toDomain(data);
    }

    public async findByOrganization(organizationId: OrganizationId): Promise<FinancialValidation[]> {
        const { data, error } = await this.supabase
            .from(this.table)
            .select('*')
            .eq('organization_id', organizationId.value)
            .order('executed_at', { ascending: false });

        if (error || !data) return [];
        return data.map(row => this.toDomain(row));
    }

    private toPersistence(val: FinancialValidation): any {
        return {
            id: val.id.value,
            organization_id: val.organizationId.value,
            target_category: val.targetCategory.value,
            status: val.status,
            executed_at: val.executedAt.toISOString(),
            results: val.results.map(r => ({
                id: r.id.value,
                category: r.category.value,
                execution_time_ms: r.executionTimeMs,
                issues: r.issues.map(i => ({
                    id: i.id.value,
                    rule_code: i.ruleCode.value,
                    severity: i.severity.value,
                    message: i.message,
                    reference_id: i.referenceId
                }))
            }))
        };
    }

    private toDomain(row: any): FinancialValidation {
        const results = (row.results || []).map((rRow: any) => {
            const issues = (rRow.issues || []).map((iRow: any) => 
                ValidationIssue.create(
                    new EntityId(iRow.id),
                    new ValidationCode(iRow.rule_code),
                    new ValidationSeverity(iRow.severity),
                    iRow.message,
                    iRow.reference_id
                )
            );

            return ValidationResult.create(
                new EntityId(rRow.id),
                new ValidationCategory(rRow.category),
                issues,
                rRow.execution_time_ms
            );
        });

        return FinancialValidation.load(
            new ValidationId(row.id),
            new OrganizationId(row.organization_id),
            new ValidationCategory(row.target_category),
            results,
            row.status,
            new Date(row.executed_at)
        );
    }
}
