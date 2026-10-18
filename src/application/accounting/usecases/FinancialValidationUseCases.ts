import { IFinancialValidationRepository } from '../../../domain/accounting/repositories/IFinancialValidationRepository';
import { FinancialValidation } from '../../../domain/accounting/aggregates/FinancialValidation';
import { ValidationId } from '../../../domain/accounting/valueobjects/ValidationId';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { ValidationCategory, CategoryType } from '../../../domain/accounting/valueobjects/ValidationCategory';
import { ValidationResult } from '../../../domain/accounting/entities/ValidationResult';
import { ValidationIssue } from '../../../domain/accounting/entities/ValidationIssue';
import { ValidationCode } from '../../../domain/accounting/valueobjects/ValidationCode';
import { ValidationSeverity } from '../../../domain/accounting/valueobjects/ValidationSeverity';
import { EntityId } from '../../../domain/shared/valueobjects/EntityId';
import { IEventBus } from '../../ports/IEventBus';
import { BusinessRuleError } from '../../../domain/shared/errors/BusinessRuleError';
import * as crypto from 'crypto';
import { ExecuteValidationDTO, FinancialValidationDTO } from '../dtos/FinancialValidationDTOs';

// Abstracted interfaces for dependencies
import { IAccountRepository } from '../../../domain/accounting/repositories/IAccountRepository';
import { IPostingRepository } from '../../../domain/accounting/repositories/IPostingRepository';
import { ITrialBalanceRepository } from '../../../domain/accounting/repositories/ITrialBalanceRepository';
import { IBalanceSheetRepository } from '../../../domain/accounting/repositories/IBalanceSheetRepository';
import { ILedgerEntryQuery } from '../../../domain/accounting/repositories/ILedgerEntryQuery';

export class FinancialValidationUseCases {
    constructor(
        private readonly validationRepo: IFinancialValidationRepository,
        private readonly accountRepo: IAccountRepository,
        private readonly postingRepo: IPostingRepository,
        private readonly trialBalanceRepo: ITrialBalanceRepository,
        private readonly balanceSheetRepo: IBalanceSheetRepository,
        private readonly ledgerQuery: ILedgerEntryQuery,
        private readonly eventBus: IEventBus
    ) {}

    public async executeFinancialValidation(dto: ExecuteValidationDTO): Promise<FinancialValidationDTO> {
        const orgId = new OrganizationId(dto.organizationId);
        const category = new ValidationCategory(dto.category);
        
        const validation = FinancialValidation.start(
            new ValidationId(crypto.randomUUID()),
            orgId,
            category
        );

        try {
            if (category.value === 'ALL' || category.value === 'CHART_OF_ACCOUNTS') {
                validation.addResult(await this.validateChartOfAccounts(orgId));
            }
            if (category.value === 'ALL' || category.value === 'POSTING_INTEGRITY') {
                validation.addResult(await this.validatePosting(orgId));
            }
            if (category.value === 'ALL' || category.value === 'TRIAL_BALANCE') {
                validation.addResult(await this.validateTrialBalance(orgId));
            }
            if (category.value === 'ALL' || category.value === 'LEDGER_INTEGRITY') {
                validation.addResult(await this.validateLedger(orgId));
            }
            if (category.value === 'ALL' || category.value === 'BALANCE_SHEET') {
                validation.addResult(await this.validateBalanceSheet(orgId));
            }

            validation.complete();
        } catch (e: any) {
            validation.fail(e.message);
        }

        await this.validationRepo.save(validation);
        await this.eventBus.publishAll(validation.domainEvents);
        validation.clearDomainEvents();

        return this.mapToDTO(validation);
    }

    public async validateChartOfAccounts(orgId: OrganizationId): Promise<ValidationResult> {
        const startTime = Date.now();
        const issues: ValidationIssue[] = [];
        const accounts = await this.accountRepo.findByOrganization(orgId);

        // Rule: Missing Parent Accounts
        // Rule: Invalid Account Classification
        for (const account of accounts) {
            if (account.code.value.length === 0) {
                issues.push(ValidationIssue.create(
                    new EntityId(crypto.randomUUID()),
                    new ValidationCode('COA-001'),
                    new ValidationSeverity('ERROR'),
                    `Account ${account.id.value} has empty code`,
                    account.id.value
                ));
            }
            // Real implementation would check circular hierarchy, missing parents, etc.
        }

        return ValidationResult.create(
            new EntityId(crypto.randomUUID()),
            new ValidationCategory('CHART_OF_ACCOUNTS'),
            issues,
            Date.now() - startTime
        );
    }

    public async validatePosting(orgId: OrganizationId): Promise<ValidationResult> {
        const startTime = Date.now();
        const issues: ValidationIssue[] = [];
        const batches = await this.postingRepo.findByOrganization(orgId);

        for (const batch of batches) {
            if (batch.status.value === 'POSTED') {
                if (batch.transactions.some(tx => !tx.result || !tx.result.isSuccess)) {
                    issues.push(ValidationIssue.create(
                        new EntityId(crypto.randomUUID()),
                        new ValidationCode('POST-001'),
                        new ValidationSeverity('ERROR'),
                        `Batch ${batch.id.value} is POSTED but contains failed transactions`,
                        batch.id.value
                    ));
                }
            }
        }

        return ValidationResult.create(
            new EntityId(crypto.randomUUID()),
            new ValidationCategory('POSTING_INTEGRITY'),
            issues,
            Date.now() - startTime
        );
    }

    public async validateTrialBalance(orgId: OrganizationId): Promise<ValidationResult> {
        const startTime = Date.now();
        const issues: ValidationIssue[] = [];
        const tbs = await this.trialBalanceRepo.findByOrganization(orgId);

        for (const tb of tbs) {
            try {
                tb.validateBalance();
            } catch (e: any) {
                issues.push(ValidationIssue.create(
                    new EntityId(crypto.randomUUID()),
                    new ValidationCode('TB-001'),
                    new ValidationSeverity('CRITICAL'),
                    `Trial Balance ${tb.id.value} is unbalanced: ${e.message}`,
                    tb.id.value
                ));
            }
        }

        return ValidationResult.create(
            new EntityId(crypto.randomUUID()),
            new ValidationCategory('TRIAL_BALANCE'),
            issues,
            Date.now() - startTime
        );
    }

    public async validateBalanceSheet(orgId: OrganizationId): Promise<ValidationResult> {
        const startTime = Date.now();
        const issues: ValidationIssue[] = [];
        const bss = await this.balanceSheetRepo.findByOrganization(orgId);

        for (const bs of bss) {
            try {
                bs.validateAccountingEquation();
            } catch (e: any) {
                issues.push(ValidationIssue.create(
                    new EntityId(crypto.randomUUID()),
                    new ValidationCode('BS-001'),
                    new ValidationSeverity('CRITICAL'),
                    `Balance Sheet ${bs.id.value} violates accounting equation: ${e.message}`,
                    bs.id.value
                ));
            }
            if (bs.sections.length === 0) {
                issues.push(ValidationIssue.create(
                    new EntityId(crypto.randomUUID()),
                    new ValidationCode('BS-002'),
                    new ValidationSeverity('ERROR'),
                    `Balance Sheet ${bs.id.value} has empty sections`,
                    bs.id.value
                ));
            }
        }

        return ValidationResult.create(
            new EntityId(crypto.randomUUID()),
            new ValidationCategory('BALANCE_SHEET'),
            issues,
            Date.now() - startTime
        );
    }

    public async validateLedger(orgId: OrganizationId): Promise<ValidationResult> {
        const startTime = Date.now();
        const issues: ValidationIssue[] = [];
        
        // Architecture only: We simulate ledger validation
        // In reality, this checks billions of rows for missing entries, dupes, etc.
        const start = new Date(0);
        const end = new Date();
        const balances = await this.ledgerQuery.calculateBalancesByDateRange(orgId, start, end);
        
        let tbDebit = 0;
        let tbCredit = 0;
        for (const bal of balances) {
            tbDebit += bal.totalDebit;
            tbCredit += bal.totalCredit;
        }

        if (Math.abs(tbDebit - tbCredit) > 0.001) {
             issues.push(ValidationIssue.create(
                 new EntityId(crypto.randomUUID()),
                 new ValidationCode('LEDG-001'),
                 new ValidationSeverity('CRITICAL'),
                 `Ledger entries are globally unbalanced. Debit: ${tbDebit}, Credit: ${tbCredit}`
             ));
        }

        return ValidationResult.create(
            new EntityId(crypto.randomUUID()),
            new ValidationCategory('LEDGER_INTEGRITY'),
            issues,
            Date.now() - startTime
        );
    }

    public async getValidationHistory(organizationId: string): Promise<FinancialValidationDTO[]> {
        const validations = await this.validationRepo.findByOrganization(new OrganizationId(organizationId));
        return validations.map(v => this.mapToDTO(v));
    }

    private mapToDTO(val: FinancialValidation): FinancialValidationDTO {
        return {
            id: val.id.value,
            organizationId: val.organizationId.value,
            targetCategory: val.targetCategory.value,
            status: val.status,
            executedAt: val.executedAt.toISOString(),
            isPassed: val.isPassed,
            results: val.results.map(r => ({
                category: r.category.value,
                isValid: r.isValid,
                executionTimeMs: r.executionTimeMs,
                issues: r.issues.map(i => ({
                    ruleCode: i.ruleCode.value,
                    severity: i.severity.value,
                    message: i.message,
                    referenceId: i.referenceId
                }))
            }))
        };
    }
}
