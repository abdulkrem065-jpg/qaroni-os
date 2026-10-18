import { ValidationError } from '../../shared/errors/ValidationError';
export class DateFormat {
    public readonly value: string;
    constructor(value: string) {
        if (!value || value.trim().length === 0) throw new ValidationError('DateFormat is required');
        this.value = value.trim();
        Object.freeze(this);
    }
}
