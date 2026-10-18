import { ValidationError } from '../../shared/errors/ValidationError';
export class FinancialYearStart {
    public readonly value: number;
    constructor(value: number) {
        if (value < 1 || value > 12) throw new ValidationError('FinancialYearStart must be a valid month (1-12)');
        this.value = value;
        Object.freeze(this);
    }
}
