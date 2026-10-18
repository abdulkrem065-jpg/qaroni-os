import { ValidationError } from '../errors/ValidationError';

export class BranchCode {
    public readonly value: string;

    private constructor(value: string) {
        this.value = value;
        Object.freeze(this);
    }

    public static create(code: string): BranchCode {
        if (!code || code.trim().length === 0) {
            throw new ValidationError('Branch code cannot be empty');
        }
        if (code.trim().length > 10) {
            throw new ValidationError('Branch code cannot exceed 10 characters');
        }
        if (!/^[A-Z0-9_-]+$/.test(code.trim().toUpperCase())) {
            throw new ValidationError('Branch code can only contain uppercase letters, numbers, hyphens, and underscores');
        }
        return new BranchCode(code.trim().toUpperCase());
    }

    public equals(other: BranchCode | null | undefined): boolean {
        if (!other) return false;
        return this.value === other.value;
    }
}
