import { ValidationError } from '../errors/ValidationError';

export class BranchName {
    public readonly value: string;

    private constructor(value: string) {
        this.value = value;
        Object.freeze(this);
    }

    public static create(name: string): BranchName {
        if (!name || name.trim().length === 0) {
            throw new ValidationError('Branch name cannot be empty');
        }
        if (name.trim().length > 100) {
            throw new ValidationError('Branch name cannot exceed 100 characters');
        }
        return new BranchName(name.trim());
    }

    public equals(other: BranchName | null | undefined): boolean {
        if (!other) return false;
        return this.value === other.value;
    }
}
