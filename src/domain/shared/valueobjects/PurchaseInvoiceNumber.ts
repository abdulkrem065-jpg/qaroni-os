import { ValidationError } from '../errors/ValidationError';
export class PurchaseInvoiceNumber {
    public readonly value: string;
    private constructor(value: string) {
        this.value = value;
        Object.freeze(this);
    }
    public static create(value: string): PurchaseInvoiceNumber {
        if (!value || value.trim().length === 0) throw new ValidationError('PurchaseInvoiceNumber cannot be empty');
        return new PurchaseInvoiceNumber(value.trim());
    }
}
