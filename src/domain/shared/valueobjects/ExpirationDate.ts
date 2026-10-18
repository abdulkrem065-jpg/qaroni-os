import { ValidationError } from '../errors/ValidationError';
export class ExpirationDate {
    public readonly value: Date;
    private constructor(value: Date) {
        this.value = value;
        Object.freeze(this);
    }
    public static create(date: Date): ExpirationDate {
        if (isNaN(date.getTime())) {
            throw new ValidationError('Invalid expiration date');
        }
        return new ExpirationDate(date);
    }
}
