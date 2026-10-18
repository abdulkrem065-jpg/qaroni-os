import { ValidationError } from '../errors/ValidationError';
export class MoneyAmount {
    public readonly value: number;
    private constructor(value: number) {
        this.value = value;
        Object.freeze(this);
    }
    public static create(value: number): MoneyAmount {
        if (value < 0) throw new ValidationError('Money amount cannot be negative');
        return new MoneyAmount(value);
    }
    public add(other: MoneyAmount): MoneyAmount {
        return MoneyAmount.create(this.value + other.value);
    }
    public subtract(other: MoneyAmount): MoneyAmount {
        if (this.value < other.value) throw new ValidationError('Subtraction would result in negative money amount');
        return MoneyAmount.create(this.value - other.value);
    }
}
