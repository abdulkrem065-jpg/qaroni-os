import { ValidationError } from '../../shared/errors/ValidationError';
export class AccountCategory {
    public readonly value: string;
    constructor(value: string) {
        if (!value || value.trim().length === 0) throw new ValidationError('AccountCategory cannot be empty');
        this.value = value.trim().toUpperCase();
        Object.freeze(this);
    }
}
