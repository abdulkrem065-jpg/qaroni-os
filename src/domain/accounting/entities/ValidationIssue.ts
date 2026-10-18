import { Entity } from '../../shared/core/Entity';
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
