import { ValidationError } from '../errors/ValidationError';
export class CostPrice {
    public readonly amount: number;
    public readonly currency: string;
    private constructor(amount: number, currency: string) {
        this.amount = amount;
        this.currency = currency;
        Object.freeze(this);
    }
    public static create(amount: number, currency: string = 'USD'): CostPrice {
        if (amount < 0) {
            throw new ValidationError('Cost price cannot be negative');
        }
        return new CostPrice(amount, currency.toUpperCase());
    }
}
