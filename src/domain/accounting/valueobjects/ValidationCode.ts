import { ValidationError } from '../../shared/errors/ValidationError';
export class ValidationCode {
    public readonly value: string;
    constructor(value: string) {
        if (!value || value.trim().length === 0) throw new ValidationError('ValidationCode cannot be empty');
        this.value = value;
        Object.freeze(this);
    }
}
