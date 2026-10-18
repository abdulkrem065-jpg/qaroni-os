import { ValidationError } from '../../shared/errors/ValidationError';
export type PostingStatusType = 'DRAFT' | 'APPROVED' | 'POSTING_REQUESTED' | 'POSTING_RUNNING' | 'POSTED' | 'LOCKED' | 'FAILED' | 'ROLLED_BACK';
export class PostingStatus {
    public readonly value: PostingStatusType;
    constructor(value: string) {
        const upper = value.trim().toUpperCase();
        const validStatuses = ['DRAFT', 'APPROVED', 'POSTING_REQUESTED', 'POSTING_RUNNING', 'POSTED', 'LOCKED', 'FAILED', 'ROLLED_BACK'];
        if (!validStatuses.includes(upper)) throw new ValidationError(`Invalid PostingStatus: ${upper}`);
        this.value = upper as PostingStatusType;
        Object.freeze(this);
    }
}
