import { ValidationError } from '../../shared/errors/ValidationError';

export type CustomerStatusValue = 'ACTIVE' | 'ARCHIVED';

export class CustomerStatus {
    public readonly value: CustomerStatusValue;

    constructor(value: CustomerStatusValue) {
        if (value !== 'ACTIVE' && value !== 'ARCHIVED') {
            throw new ValidationError('Invalid CustomerStatus');
        }
        this.value = value;
        Object.freeze(this);
    }
}
