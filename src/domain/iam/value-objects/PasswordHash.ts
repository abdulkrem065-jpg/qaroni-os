import { DomainError } from '../errors/DomainError';

export class PasswordHash {
    constructor(public readonly value: string) {
        if (!value || value.trim().length === 0) {
            throw new DomainError('PasswordHash cannot be empty');
        }
        
        // Ensure it's not a plain text representation (e.g. must be bcrypt/argon2 format)
        // Simplistic check for a hash pattern, like $2a$ or $argon2...
        // For the sake of the domain invariant, we just assert it doesn't look like plaintext.
        if (!value.startsWith('$2') && !value.startsWith('$argon2')) {
            throw new DomainError('PasswordHash cannot be plain text');
        }
    }

    public equals(other: PasswordHash): boolean {
        return this.value === other.value;
    }
}
