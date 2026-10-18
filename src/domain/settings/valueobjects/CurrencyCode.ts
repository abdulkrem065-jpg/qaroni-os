import { ValidationError } from '../../shared/errors/ValidationError';
export class CurrencyCode {
    public readonly value: string;
    constructor(value: string) {
        if (!value || value.trim().length !== 3) {
            throw new ValidationError('CurrencyCode must be exactly 3 characters (ISO 4217)');
        }
        this.value = value.trim().toUpperCase();
        Object.freeze(this);
    }
}
