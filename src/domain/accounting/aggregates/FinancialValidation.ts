import { AggregateRoot } from '../../shared/core/AggregateRoot';
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
