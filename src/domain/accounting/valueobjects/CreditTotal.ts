import { ValidationError } from '../../shared/errors/ValidationError';
export class CreditTotal {
    public readonly value: number;
    constructor(value: number) {
        if (value < 0) throw new ValidationError('CreditTotal cannot be negative');
        this.value = value;
        Object.freeze(this);
    }
}
