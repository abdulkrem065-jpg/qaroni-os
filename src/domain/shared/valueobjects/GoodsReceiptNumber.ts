import { ValidationError } from '../errors/ValidationError';
export class GoodsReceiptNumber {
    public readonly value: string;
    private constructor(value: string) {
        this.value = value;
        Object.freeze(this);
    }
    public static create(value: string): GoodsReceiptNumber {
        if (!value || value.trim().length === 0) throw new ValidationError('GoodsReceiptNumber cannot be empty');
        return new GoodsReceiptNumber(value.trim());
    }
}
