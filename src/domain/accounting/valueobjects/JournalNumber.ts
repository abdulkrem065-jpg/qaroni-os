import { ValidationError } from '../../shared/errors/ValidationError';
export class JournalNumber {
    public readonly value: string;
    constructor(value: string) {
        if (!value || value.trim().length === 0) throw new ValidationError('JournalNumber cannot be empty');
        this.value = value.trim();
        Object.freeze(this);
    }
}
