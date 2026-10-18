import { ValidationError } from '../../shared/errors/ValidationError';
export class LedgerPeriod {
    public readonly value: string;
    constructor(value: string) {
        // e.g., '2026-07'
        if (!/^\d{4}-\d{2}$/.test(value)) throw new ValidationError('LedgerPeriod must be in YYYY-MM format');
        this.value = value;
        Object.freeze(this);
    }
}
