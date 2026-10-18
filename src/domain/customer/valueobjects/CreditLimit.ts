import { ValidationError } from '../../shared/errors/ValidationError';

export class CreditLimit {
    public readonly value: number;

    constructor(value: number) {
        if (value < 0) {
            throw new ValidationError('CreditLimit cannot be negative');
        }
        this.value = value;
        Object.freeze(this);
    }
}
