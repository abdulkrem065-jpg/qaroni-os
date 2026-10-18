import { ValidationError } from '../errors/ValidationError';
export class ReceiptNumber {
    public readonly value: string;
    private constructor(value: string) {
        this.value = value;
        Object.freeze(this);
    }
    public static create(value: string): ReceiptNumber {
        if (!value || value.trim().length === 0) throw new ValidationError('ReceiptNumber cannot be empty');
        return new ReceiptNumber(value.trim());
    }
}
