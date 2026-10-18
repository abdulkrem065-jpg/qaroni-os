import { ValidationError } from '../errors/ValidationError';
export class SellingPrice {
    public readonly amount: number;
    public readonly currency: string;
    private constructor(amount: number, currency: string) {
        this.amount = amount;
        this.currency = currency;
        Object.freeze(this);
    }
    public static create(amount: number, currency: string = 'USD'): SellingPrice {
        if (amount < 0) {
            throw new ValidationError('Selling price cannot be negative');
        }
        return new SellingPrice(amount, currency.toUpperCase());
    }
}
