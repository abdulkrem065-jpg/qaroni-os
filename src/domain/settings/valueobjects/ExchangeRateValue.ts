import { ValidationError } from '../../shared/errors/ValidationError';
export class ExchangeRateValue {
    public readonly value: number;
    constructor(value: number) {
        if (value <= 0) {
            throw new ValidationError('ExchangeRateValue must be greater than 0');
        }
        this.value = value;
        Object.freeze(this);
    }
}
