import { ValidationError } from '../errors/ValidationError';
export class SKU {
    public readonly value: string;
    private constructor(value: string) {
        this.value = value;
        Object.freeze(this);
    }
    public static create(sku: string): SKU {
        if (!sku || sku.trim().length === 0) {
            throw new ValidationError('SKU cannot be empty');
        }
        return new SKU(sku.trim().toUpperCase());
    }
    public equals(other: SKU | null | undefined): boolean {
        if (!other) return false;
        return this.value === other.value;
    }
}
