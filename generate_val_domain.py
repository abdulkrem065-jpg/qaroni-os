import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

# Value Objects
create_file('src/domain/accounting/valueobjects/ValidationId.ts', """import { EntityId } from '../../shared/valueobjects/EntityId';
export class ValidationId extends EntityId {}
""")

create_file('src/domain/accounting/valueobjects/ValidationSeverity.ts', """import { ValidationError } from '../../shared/errors/ValidationError';
export type SeverityType = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
export class ValidationSeverity {
    public readonly value: SeverityType;
    constructor(value: string) {
        if (!['INFO', 'WARNING', 'ERROR', 'CRITICAL'].includes(value)) {
            throw new ValidationError('Invalid ValidationSeverity');
        }
        this.value = value as SeverityType;
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/ValidationCode.ts', """import { ValidationError } from '../../shared/errors/ValidationError';
export class ValidationCode {
    public readonly value: string;
    constructor(value: string) {
        if (!value || value.trim().length === 0) throw new ValidationError('ValidationCode cannot be empty');
        this.value = value;
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/ValidationCategory.ts', """import { ValidationError } from '../../shared/errors/ValidationError';
export type CategoryType = 'ACCOUNTING_EQUATION' | 'TRIAL_BALANCE' | 'LEDGER_INTEGRITY' | 'CHART_OF_ACCOUNTS' | 'POSTING_INTEGRITY' | 'BALANCE_SHEET' | 'PERIOD_INTEGRITY' | 'CURRENCY' | 'BRANCH' | 'ALL';
export class ValidationCategory {
    public readonly value: CategoryType;
    constructor(value: string) {
        const valid = ['ACCOUNTING_EQUATION', 'TRIAL_BALANCE', 'LEDGER_INTEGRITY', 'CHART_OF_ACCOUNTS', 'POSTING_INTEGRITY', 'BALANCE_SHEET', 'PERIOD_INTEGRITY', 'CURRENCY', 'BRANCH', 'ALL'];
        if (!valid.includes(value)) {
            throw new ValidationError('Invalid ValidationCategory');
        }
        this.value = value as CategoryType;
        Object.freeze(this);
    }
}
""")

# Entities
create_file('src/domain/accounting/entities/ValidationRule.ts', """import { Entity } from '../../shared/core/Entity';
import { EntityId } from '../../shared/valueobjects/EntityId';
import { ValidationCategory } from '../valueobjects/ValidationCategory';
import { ValidationCode } from '../valueobjects/ValidationCode';
import { ValidationSeverity } from '../valueobjects/ValidationSeverity';

export class ValidationRule extends Entity<EntityId> {
    private constructor(
        id: EntityId,
        private readonly _code: ValidationCode,
        private readonly _category: ValidationCategory,
        private readonly _name: string,
        private readonly _description: string,
        private readonly _severity: ValidationSeverity
    ) {
        super(id);
    }

    public static create(
        id: EntityId,
        code: ValidationCode,
        category: ValidationCategory,
        name: string,
        description: string,
        severity: ValidationSeverity
    ): ValidationRule {
        return new ValidationRule(id, code, category, name, description, severity);
    }

    public get code(): ValidationCode { return this._code; }
    public get category(): ValidationCategory { return this._category; }
    public get name(): string { return this._name; }
    public get description(): string { return this._description; }
    public get severity(): ValidationSeverity { return this._severity; }
}
""")

create_file('src/domain/accounting/entities/ValidationIssue.ts', """import { Entity } from '../../shared/core/Entity';
import { EntityId } from '../../shared/valueobjects/EntityId';
import { ValidationCode } from '../valueobjects/ValidationCode';
import { ValidationSeverity } from '../valueobjects/ValidationSeverity';

export class ValidationIssue extends Entity<EntityId> {
    private constructor(
        id: EntityId,
        private readonly _ruleCode: ValidationCode,
        private readonly _severity: ValidationSeverity,
        private readonly _message: string,
        private readonly _referenceId?: string // Can be a JournalId, AccountId, etc.
    ) {
        super(id);
    }

    public static create(
        id: EntityId,
        ruleCode: ValidationCode,
        severity: ValidationSeverity,
        message: string,
        referenceId?: string
    ): ValidationIssue {
        return new ValidationIssue(id, ruleCode, severity, message, referenceId);
    }

    public get ruleCode(): ValidationCode { return this._ruleCode; }
    public get severity(): ValidationSeverity { return this._severity; }
    public get message(): string { return this._message; }
    public get referenceId(): string | undefined { return this._referenceId; }
}
""")

create_file('src/domain/accounting/entities/ValidationResult.ts', """import { Entity } from '../../shared/core/Entity';
import { EntityId } from '../../shared/valueobjects/EntityId';
import { ValidationCategory } from '../valueobjects/ValidationCategory';
import { ValidationIssue } from './ValidationIssue';

export class ValidationResult extends Entity<EntityId> {
    private constructor(
        id: EntityId,
        private readonly _category: ValidationCategory,
        private readonly _issues: ValidationIssue[],
        private readonly _executionTimeMs: number
    ) {
        super(id);
    }

    public static create(
        id: EntityId,
        category: ValidationCategory,
        issues: ValidationIssue[],
        executionTimeMs: number
    ): ValidationResult {
        return new ValidationResult(id, category, issues, executionTimeMs);
    }

    public get isValid(): boolean {
        // Only ERROR or CRITICAL fail the validation
        return !this._issues.some(i => i.severity.value === 'ERROR' || i.severity.value === 'CRITICAL');
    }

    public get category(): ValidationCategory { return this._category; }
    public get issues(): ReadonlyArray<ValidationIssue> { return this._issues; }
    public get executionTimeMs(): number { return this._executionTimeMs; }
}
""")

# Events
create_file('src/domain/accounting/events/FinancialValidationEvents.ts', """import { IDomainEvent } from '../../shared/core/IDomainEvent';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { ValidationId } from '../valueobjects/ValidationId';

export class FinancialValidationStartedEvent implements IDomainEvent {
    public readonly occurredOn: Date = new Date();
    public readonly eventName: string = this.constructor.name;
    constructor(public readonly organizationId: OrganizationId, public readonly validationId: ValidationId) {}
}

export class FinancialValidationCompletedEvent implements IDomainEvent {
    public readonly occurredOn: Date = new Date();
    public readonly eventName: string = this.constructor.name;
    constructor(public readonly organizationId: OrganizationId, public readonly validationId: ValidationId) {}
}

export class FinancialValidationFailedEvent implements IDomainEvent {
    public readonly occurredOn: Date = new Date();
    public readonly eventName: string = this.constructor.name;
    constructor(public readonly organizationId: OrganizationId, public readonly validationId: ValidationId, public readonly reason: string) {}
}

export class FinancialIntegrityViolationDetectedEvent implements IDomainEvent {
    public readonly occurredOn: Date = new Date();
    public readonly eventName: string = this.constructor.name;
    constructor(public readonly organizationId: OrganizationId, public readonly validationId: ValidationId, public readonly issuesCount: number) {}
}
""")

# Aggregate
create_file('src/domain/accounting/aggregates/FinancialValidation.ts', """import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { ValidationId } from '../valueobjects/ValidationId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { ValidationCategory } from '../valueobjects/ValidationCategory';
import { ValidationResult } from '../entities/ValidationResult';
import { FinancialValidationStartedEvent, FinancialValidationCompletedEvent, FinancialIntegrityViolationDetectedEvent, FinancialValidationFailedEvent } from '../events/FinancialValidationEvents';

export class FinancialValidation extends AggregateRoot<ValidationId> {
    private constructor(
        id: ValidationId,
        private readonly _organizationId: OrganizationId,
        private readonly _targetCategory: ValidationCategory,
        private _results: ValidationResult[],
        private _status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED',
        private _executedAt: Date
    ) {
        super(id);
    }

    public static start(
        id: ValidationId,
        organizationId: OrganizationId,
        targetCategory: ValidationCategory
    ): FinancialValidation {
        const validation = new FinancialValidation(id, organizationId, targetCategory, [], 'RUNNING', new Date());
        validation.addDomainEvent(new FinancialValidationStartedEvent(organizationId, id));
        return validation;
    }

    public static load(
        id: ValidationId,
        organizationId: OrganizationId,
        targetCategory: ValidationCategory,
        results: ValidationResult[],
        status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED',
        executedAt: Date
    ): FinancialValidation {
        return new FinancialValidation(id, organizationId, targetCategory, results, status, executedAt);
    }

    public addResult(result: ValidationResult): void {
        this._results.push(result);
    }

    public complete(): void {
        this._status = 'COMPLETED';
        this.addDomainEvent(new FinancialValidationCompletedEvent(this._organizationId, this.id));
        
        const isInvalid = this._results.some(r => !r.isValid);
        if (isInvalid) {
            const issuesCount = this._results.reduce((sum, r) => sum + r.issues.length, 0);
            this.addDomainEvent(new FinancialIntegrityViolationDetectedEvent(this._organizationId, this.id, issuesCount));
        }
    }

    public fail(reason: string): void {
        this._status = 'FAILED';
        this.addDomainEvent(new FinancialValidationFailedEvent(this._organizationId, this.id, reason));
    }

    public get organizationId(): OrganizationId { return this._organizationId; }
    public get targetCategory(): ValidationCategory { return this._targetCategory; }
    public get results(): ReadonlyArray<ValidationResult> { return this._results; }
    public get status(): 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' { return this._status; }
    public get executedAt(): Date { return this._executedAt; }
    public get isPassed(): boolean {
        if (this._status !== 'COMPLETED') return false;
        return !this._results.some(r => !r.isValid);
    }
}
""")

print("Financial Validation Domain logic created")
