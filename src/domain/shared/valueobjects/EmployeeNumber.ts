import { ValidationError } from '../errors/ValidationError';
export class EmployeeNumber {
    public readonly value: string;
    private constructor(value: string) {
        this.value = value;
        Object.freeze(this);
    }
    public static create(num: string): EmployeeNumber {
        if (!num || num.trim().length === 0) {
            throw new ValidationError('Employee number cannot be empty');
        }
        return new EmployeeNumber(num.trim().toUpperCase());
    }
    public equals(other: EmployeeNumber | null | undefined): boolean {
        if (!other) return false;
        return this.value === other.value;
    }
}
