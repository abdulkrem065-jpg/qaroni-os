import { Entity } from '../../shared/core/Entity';
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
