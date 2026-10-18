import { ValidationError } from '../../shared/errors/ValidationError';

export type AccountStatusType = 'ACTIVE' | 'ARCHIVED';

export class AccountStatus {
    public readonly value: AccountStatusType;

    constructor(value: string) {
        const upper = value.trim().toUpperCase();
        if (upper !== 'ACTIVE' && upper !== 'ARCHIVED') {
            throw new ValidationError(`Invalid AccountStatus: ${upper}`);
        }
        this.value = upper as AccountStatusType;
        Object.freeze(this);
    }

    public isActive(): boolean {
        return this.value === 'ACTIVE';
    }

    public isArchived(): boolean {
        return this.value === 'ARCHIVED';
    }
}
