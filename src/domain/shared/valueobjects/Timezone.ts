import { ValidationError } from '../errors/ValidationError';

export class Timezone {
    public readonly value: string;

    private constructor(value: string) {
        this.value = value;
        Object.freeze(this);
    }

    public static create(timezone: string): Timezone {
        if (!timezone || timezone.trim().length === 0) {
            throw new ValidationError('Timezone cannot be empty');
        }
        return new Timezone(timezone.trim());
    }

    public equals(other: Timezone | null | undefined): boolean {
        if (!other) return false;
        return this.value === other.value;
    }
}
