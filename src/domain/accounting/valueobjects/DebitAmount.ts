import { ValidationError } from '../../shared/errors/ValidationError';
export class DebitAmount {
    public readonly value: number;
    constructor(value: number) {
        if (value < 0) throw new ValidationError('DebitAmount cannot be negative');
        this.value = value;
        Object.freeze(this);
    }
}
