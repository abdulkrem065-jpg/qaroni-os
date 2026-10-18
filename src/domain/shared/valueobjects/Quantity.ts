import { ValidationError } from '../errors/ValidationError';
export class Quantity {
    public readonly value: number;
    private constructor(value: number) {
        this.value = value;
        Object.freeze(this);
    }
    public static create(amount: number): Quantity {
        if (amount < 0) {
            throw new ValidationError('Quantity cannot be negative');
        }
        return new Quantity(amount);
    }
    public add(other: Quantity): Quantity {
        return Quantity.create(this.value + other.value);
    }
    public subtract(other: Quantity): Quantity {
        if (this.value < other.value) {
            throw new ValidationError('Subtraction would result in negative quantity');
        }
        return Quantity.create(this.value - other.value);
    }
}
