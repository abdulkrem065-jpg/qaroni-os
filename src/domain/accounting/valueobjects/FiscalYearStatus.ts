import { ValidationError } from '../../shared/errors/ValidationError';

export type FiscalYearStatusType = 'OPEN' | 'CLOSED';

export class FiscalYearStatus {
    public readonly value: FiscalYearStatusType;

    constructor(value: string) {
        const upper = value.trim().toUpperCase();
        if (upper !== 'OPEN' && upper !== 'CLOSED') {
            throw new ValidationError('Invalid FiscalYearStatus');
        }
        this.value = upper as FiscalYearStatusType;
        Object.freeze(this);
    }

    public isOpen(): boolean {
        return this.value === 'OPEN';
    }
}
