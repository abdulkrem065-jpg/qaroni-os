import { ValidationError } from '../../shared/errors/ValidationError';
export class AccountCode {
    public readonly value: string;
    constructor(value: string) {
        if (!value || value.trim().length === 0) throw new ValidationError('AccountCode cannot be empty');
        if (!/^[A-Za-z0-9-_.]+$/.test(value)) throw new ValidationError('AccountCode contains invalid characters');
        this.value = value.trim();
        Object.freeze(this);
    }
}
