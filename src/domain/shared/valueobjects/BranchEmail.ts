import { ValidationError } from '../errors/ValidationError';

export class BranchEmail {
    public readonly value: string;

    private constructor(value: string) {
        this.value = value;
        Object.freeze(this);
    }

    public static create(email: string): BranchEmail {
        if (!email || email.trim().length === 0) {
            throw new ValidationError('Branch email cannot be empty');
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            throw new ValidationError('Invalid branch email format');
        }
        return new BranchEmail(email.trim());
    }

    public equals(other: BranchEmail | null | undefined): boolean {
        if (!other) return false;
        return this.value === other.value;
    }
}
