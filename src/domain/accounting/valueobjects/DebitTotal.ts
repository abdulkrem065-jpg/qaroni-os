import { ValidationError } from '../../shared/errors/ValidationError';
export class DebitTotal {
    public readonly value: number;
    constructor(value: number) {
        if (value < 0) throw new ValidationError('DebitTotal cannot be negative');
        this.value = value;
        Object.freeze(this);
    }
}
