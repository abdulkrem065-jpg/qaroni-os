import { ValidationError } from '../../shared/errors/ValidationError';

export type PeriodStatusType = 'OPENING' | 'CLOSING' | 'LOCKED' | 'ARCHIVED';

export class PeriodStatus {
    public readonly value: PeriodStatusType;

    constructor(value: string) {
        const upper = value.trim().toUpperCase();
        const validStatuses = ['OPENING', 'CLOSING', 'LOCKED', 'ARCHIVED'];
        if (!validStatuses.includes(upper)) {
            throw new ValidationError('Invalid PeriodStatus');
        }
        this.value = upper as PeriodStatusType;
        Object.freeze(this);
    }

    public isOpening(): boolean { return this.value === 'OPENING'; }
    public isClosing(): boolean { return this.value === 'CLOSING'; }
    public isLocked(): boolean { return this.value === 'LOCKED'; }
    public isArchived(): boolean { return this.value === 'ARCHIVED'; }
    
    public canPostNormalJournals(): boolean { return this.isOpening(); }
    public canPostAdjustingJournals(): boolean { return this.isOpening() || this.isClosing(); }
    public canModify(): boolean { return !this.isArchived(); }
}
