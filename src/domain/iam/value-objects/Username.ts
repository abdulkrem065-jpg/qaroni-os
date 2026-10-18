import { DomainError } from '../errors/DomainError';

export class Username {
    constructor(public readonly value: string) {
        if (!value || value.trim().length === 0) {
            throw new DomainError('Username cannot be empty');
        }
        
        if (value.length < 3) {
            throw new DomainError('Username must be at least 3 characters long');
        }
    }

    public equals(other: Username): boolean {
        return this.value === other.value;
    }
}
