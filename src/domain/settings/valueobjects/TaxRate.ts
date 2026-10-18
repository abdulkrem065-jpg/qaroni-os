import { ValidationError } from '../../shared/errors/ValidationError';
export class TaxRate {
    public readonly value: number;
    constructor(value: number) {
        if (value < 0) {
            throw new ValidationError('TaxRate cannot be negative');
        }
        this.value = value;
        Object.freeze(this);
    }
}
