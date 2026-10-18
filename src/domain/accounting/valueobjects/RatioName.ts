import { ValidationError } from '../../shared/errors/ValidationError';
export class RatioName {
    constructor(public readonly value: string) {
        if (!value || value.trim() === '') throw new ValidationError('RatioName cannot be empty');
        Object.freeze(this);
    }
}
