import { ValidationError } from '../errors/ValidationError';
export class SupplierCode {
    public readonly value: string;
    private constructor(value: string) {
        this.value = value;
        Object.freeze(this);
    }
    public static create(value: string): SupplierCode {
        if (!value || value.trim().length === 0) throw new ValidationError('SupplierCode cannot be empty');
        return new SupplierCode(value.trim());
    }
}
