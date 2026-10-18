import { ValidationError } from '../errors/ValidationError';
export class EmploymentDate {
    public readonly value: Date;
    private constructor(value: Date) {
        this.value = value;
        Object.freeze(this);
    }
    public static create(date: Date): EmploymentDate {
        if (!(date instanceof Date) || isNaN(date.getTime())) {
            throw new ValidationError('Invalid employment date');
        }
        return new EmploymentDate(date);
    }
    public equals(other: EmploymentDate | null | undefined): boolean {
        if (!other) return false;
        return this.value.getTime() === other.value.getTime();
    }
}
