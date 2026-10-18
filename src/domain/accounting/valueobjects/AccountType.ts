import { ValidationError } from '../../shared/errors/ValidationError';

export type StandardAccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

export class AccountType {
    public readonly value: StandardAccountType;

    constructor(value: string) {
        const upper = value.trim().toUpperCase();
        const standardTypes = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'];
        if (!standardTypes.includes(upper)) throw new ValidationError('Invalid AccountType');
        this.value = upper as StandardAccountType;
        Object.freeze(this);
    }

    public isPermanent(): boolean {
        return this.value === 'ASSET' || this.value === 'LIABILITY' || this.value === 'EQUITY';
    }

    public isTemporary(): boolean {
        return this.value === 'REVENUE' || this.value === 'EXPENSE';
    }
}
