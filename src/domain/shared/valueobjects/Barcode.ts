import { ValidationError } from '../errors/ValidationError';
export class Barcode {
    public readonly value: string;
    private constructor(value: string) {
        this.value = value;
        Object.freeze(this);
    }
    public static create(barcode: string): Barcode {
        if (!barcode || barcode.trim().length === 0) {
            throw new ValidationError('Barcode cannot be empty');
        }
        return new Barcode(barcode.trim());
    }
    public equals(other: Barcode | null | undefined): boolean {
        if (!other) return false;
        return this.value === other.value;
    }
}
