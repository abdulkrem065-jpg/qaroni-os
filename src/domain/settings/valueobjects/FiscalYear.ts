import { ValidationError } from '../../shared/errors/ValidationError';
export class FiscalYear {
    public readonly value: number;
    constructor(value: number) {
        if (value < 1900 || value > 2100) {
            throw new ValidationError('FiscalYear is out of bounds');
        }
        this.value = value;
        Object.freeze(this);
    }
}
