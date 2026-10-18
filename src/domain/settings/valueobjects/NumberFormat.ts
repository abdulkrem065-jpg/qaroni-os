import { ValidationError } from '../../shared/errors/ValidationError';
export class NumberFormat {
    public readonly value: string;
    constructor(value: string) {
        if (!value || value.trim().length === 0) throw new ValidationError('NumberFormat is required');
        this.value = value.trim();
        Object.freeze(this);
    }
}
