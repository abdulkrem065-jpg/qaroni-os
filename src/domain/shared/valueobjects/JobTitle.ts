import { ValidationError } from '../errors/ValidationError';
export class JobTitle {
    public readonly value: string;
    private constructor(value: string) {
        this.value = value;
        Object.freeze(this);
    }
    public static create(title: string): JobTitle {
        if (!title || title.trim().length === 0) {
            throw new ValidationError('Job title cannot be empty');
        }
        return new JobTitle(title.trim());
    }
    public equals(other: JobTitle | null | undefined): boolean {
        if (!other) return false;
        return this.value === other.value;
    }
}
