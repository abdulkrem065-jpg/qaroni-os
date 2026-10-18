import { ValidationError } from '../errors/ValidationError';
export class SupplierName {
    public readonly value: string;
    private constructor(value: string) {
        this.value = value;
        Object.freeze(this);
    }
    public static create(value: string): SupplierName {
        if (!value || value.trim().length === 0) throw new ValidationError('SupplierName cannot be empty');
        return new SupplierName(value.trim());
    }
}
