import { ValidationError } from '../errors/ValidationError';
export class UnitOfMeasure {
    public readonly value: string;
    private constructor(value: string) {
        this.value = value;
        Object.freeze(this);
    }
    public static create(uom: string): UnitOfMeasure {
        if (!uom || uom.trim().length === 0) {
            throw new ValidationError('Unit of measure cannot be empty');
        }
        return new UnitOfMeasure(uom.trim().toUpperCase());
    }
}
