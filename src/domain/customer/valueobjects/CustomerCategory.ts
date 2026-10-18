import { ValidationError } from '../../shared/errors/ValidationError';

export class CustomerCategory {
    public readonly value: string;

    constructor(value?: string | null) {
        this.value = value?.trim() || 'REGULAR';
        Object.freeze(this);
    }
}
