import { ValidationError } from '../../shared/errors/ValidationError';
export type NormalBalanceType = 'DEBIT' | 'CREDIT';
export class NormalBalance {
    public readonly value: NormalBalanceType;
    constructor(value: string) {
        const upper = value.trim().toUpperCase();
        if (upper !== 'DEBIT' && upper !== 'CREDIT') throw new ValidationError('NormalBalance must be DEBIT or CREDIT');
        this.value = upper as NormalBalanceType;
        Object.freeze(this);
    }
}
