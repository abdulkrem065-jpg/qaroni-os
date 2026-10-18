import { ValidationError } from '../../shared/errors/ValidationError';
export class AccountLevel {
    public readonly value: number;
    constructor(value: number) {
        if (value < 0 || !Number.isInteger(value)) throw new ValidationError('AccountLevel must be a non-negative integer');
        this.value = value;
        Object.freeze(this);
    }
}
