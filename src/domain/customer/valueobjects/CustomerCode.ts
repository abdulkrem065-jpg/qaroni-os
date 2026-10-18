import { ValidationError } from '../../shared/errors/ValidationError';

export class CustomerCode {
    public readonly value: string;
    
    constructor(value: string) {
        if (!value || value.trim().length === 0) {
            throw new ValidationError('CustomerCode cannot be empty');
        }
        this.value = value.trim();
        Object.freeze(this);
    }

    public equals(other: CustomerCode | null | undefined): boolean {
        if (!other) return false;
        return this.value === other.value;
    }
}
