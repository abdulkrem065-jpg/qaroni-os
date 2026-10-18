import { DomainError } from '../errors/DomainError';

export class Email {
    constructor(public readonly value: string) {
        if (!value || value.trim().length === 0) {
            throw new DomainError('Email cannot be empty');
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            throw new DomainError(`Invalid email format: ${value}`);
        }
    }

    public equals(other: Email): boolean {
        return this.value.toLowerCase() === other.value.toLowerCase();
    }
}
