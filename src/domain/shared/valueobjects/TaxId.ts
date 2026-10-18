import { ValidationError } from '../errors/ValidationError';

export class TaxId {
    public readonly value: string;

    private constructor(value: string) {
        this.value = value;
        Object.freeze(this);
    }

    public static create(taxId: string): TaxId {
        if (!taxId || taxId.trim().length === 0) {
            throw new ValidationError('Tax ID cannot be empty');
        }
        return new TaxId(taxId.trim());
    }

    public equals(other: TaxId | null | undefined): boolean {
        if (!other) return false;
        return this.value === other.value;
    }
}
