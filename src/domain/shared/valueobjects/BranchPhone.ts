import { ValidationError } from '../errors/ValidationError';

export class BranchPhone {
    public readonly value: string;

    private constructor(value: string) {
        this.value = value;
        Object.freeze(this);
    }

    public static create(phone: string): BranchPhone {
        if (!phone || phone.trim().length === 0) {
            throw new ValidationError('Branch phone cannot be empty');
        }
        return new BranchPhone(phone.trim());
    }

    public equals(other: BranchPhone | null | undefined): boolean {
        if (!other) return false;
        return this.value === other.value;
    }
}
