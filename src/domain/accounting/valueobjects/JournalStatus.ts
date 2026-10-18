import { ValidationError } from '../../shared/errors/ValidationError';
export type JournalStatusType = 'DRAFT' | 'READY_FOR_APPROVAL' | 'APPROVED' | 'REJECTED' | 'POSTED' | 'REVERSED' | 'CANCELLED';
export class JournalStatus {
    public readonly value: JournalStatusType;
    constructor(value: string) {
        const upper = value.trim().toUpperCase();
        const validStatuses = ['DRAFT', 'READY_FOR_APPROVAL', 'APPROVED', 'REJECTED', 'POSTED', 'REVERSED', 'CANCELLED'];
        if (!validStatuses.includes(upper)) throw new ValidationError('Invalid JournalStatus');
        this.value = upper as JournalStatusType;
        Object.freeze(this);
    }
    public canModify(): boolean {
        return this.value === 'DRAFT' || this.value === 'REJECTED';
    }
    public isApproved(): boolean {
        return this.value === 'APPROVED';
    }
    public isPosted(): boolean {
        return this.value === 'POSTED';
    }
}
