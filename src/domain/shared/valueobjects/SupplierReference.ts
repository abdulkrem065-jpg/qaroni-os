import { ValidationError } from '../errors/ValidationError';
export class SupplierReference {
    public readonly value: string;
    private constructor(value: string) {
        this.value = value;
        Object.freeze(this);
    }
    public static create(value: string): SupplierReference {
        if (!value || value.trim().length === 0) throw new ValidationError('SupplierReference cannot be empty');
        return new SupplierReference(value.trim());
    }
}
