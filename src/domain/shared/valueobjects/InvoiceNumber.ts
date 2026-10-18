import { ValidationError } from '../errors/ValidationError';
export class InvoiceNumber {
    public readonly value: string;
    private constructor(value: string) {
        this.value = value;
        Object.freeze(this);
    }
    public static create(value: string): InvoiceNumber {
        if (!value || value.trim().length === 0) throw new ValidationError('InvoiceNumber cannot be empty');
        return new InvoiceNumber(value.trim());
    }
}
