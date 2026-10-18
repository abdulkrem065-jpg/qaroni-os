import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

create_file('src/domain/accounting/valueobjects/PostingId.ts', """import { EntityId } from '../../shared/valueobjects/EntityId';
export class PostingId extends EntityId {}
""")

create_file('src/domain/accounting/valueobjects/PostingBatchId.ts', """import { EntityId } from '../../shared/valueobjects/EntityId';
export class PostingBatchId extends EntityId {}
""")

create_file('src/domain/accounting/valueobjects/PostingNumber.ts', """import { ValidationError } from '../../shared/errors/ValidationError';
export class PostingNumber {
    public readonly value: string;
    constructor(value: string) {
        if (!value || value.trim().length === 0) throw new ValidationError('PostingNumber cannot be empty');
        this.value = value.trim();
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/PostingTimestamp.ts', """export class PostingTimestamp {
    public readonly value: Date;
    constructor(value?: Date | string) {
        this.value = value ? new Date(value) : new Date();
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/PostingStatus.ts', """import { ValidationError } from '../../shared/errors/ValidationError';
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
""")

create_file('src/domain/accounting/valueobjects/PostingResult.ts', """export class PostingResult {
    public readonly isSuccess: boolean;
    public readonly errorDetails: string | null;
    constructor(isSuccess: boolean, errorDetails?: string | null) {
        this.isSuccess = isSuccess;
        this.errorDetails = errorDetails || null;
        Object.freeze(this);
    }
}
""")

print("Posting VOs created")
