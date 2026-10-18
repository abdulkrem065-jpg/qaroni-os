import { ValidationError } from '../errors/ValidationError';
export class PurchaseTotal {
    public readonly value: number;
    private constructor(value: number) {
        this.value = value;
        Object.freeze(this);
    }
    public static create(value: number): PurchaseTotal {
        if (value < 0) throw new ValidationError('PurchaseTotal cannot be negative');
        return new PurchaseTotal(value);
    }
    public add(other: PurchaseTotal): PurchaseTotal {
        return PurchaseTotal.create(this.value + other.value);
    }
}
