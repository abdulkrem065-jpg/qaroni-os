import { Entity } from '../../shared/core/Entity';
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
