import { ValidationError } from '../../shared/errors/ValidationError';
export class DecimalPrecision {
    public readonly value: number;
    constructor(value: number) {
        if (value < 0 || value > 6) throw new ValidationError('DecimalPrecision must be between 0 and 6');
        this.value = value;
        Object.freeze(this);
    }
}
