import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

# Events
create_file('src/domain/accounting/events/PostingEvents.ts', """import { IDomainEvent } from '../../shared/core/IDomainEvent';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { PostingBatchId } from '../valueobjects/PostingBatchId';
import { JournalId } from '../valueobjects/JournalId';

export class JournalPostingStartedEvent implements IDomainEvent {
    public readonly occurredOn: Date = new Date();
    public readonly eventName: string = this.constructor.name;
    constructor(public readonly organizationId: OrganizationId, public readonly postingBatchId: PostingBatchId, public readonly journalId: JournalId) {}
}

export class JournalPostedEvent implements IDomainEvent {
    public readonly occurredOn: Date = new Date();
    public readonly eventName: string = this.constructor.name;
    constructor(public readonly organizationId: OrganizationId, public readonly postingBatchId: PostingBatchId, public readonly journalId: JournalId) {}
}

export class PostingCompletedEvent implements IDomainEvent {
    public readonly occurredOn: Date = new Date();
    public readonly eventName: string = this.constructor.name;
    constructor(public readonly organizationId: OrganizationId, public readonly postingBatchId: PostingBatchId) {}
}

export class PostingFailedEvent implements IDomainEvent {
    public readonly occurredOn: Date = new Date();
    public readonly eventName: string = this.constructor.name;
    constructor(public readonly organizationId: OrganizationId, public readonly postingBatchId: PostingBatchId, public readonly reason: string) {}
}

export class PostingRolledBackEvent implements IDomainEvent {
    public readonly occurredOn: Date = new Date();
    public readonly eventName: string = this.constructor.name;
    constructor(public readonly organizationId: OrganizationId, public readonly postingBatchId: PostingBatchId) {}
}

export class PostingLockedEvent implements IDomainEvent {
    public readonly occurredOn: Date = new Date();
    public readonly eventName: string = this.constructor.name;
    constructor(public readonly organizationId: OrganizationId, public readonly postingBatchId: PostingBatchId) {}
}
""")

# Entity
create_file('src/domain/accounting/entities/PostingTransaction.ts', """import { Entity } from '../../shared/core/Entity';
import { PostingId } from '../valueobjects/PostingId';
import { JournalId } from '../valueobjects/JournalId';
import { PostingTimestamp } from '../valueobjects/PostingTimestamp';
import { PostingResult } from '../valueobjects/PostingResult';

export class PostingTransaction extends Entity<PostingId> {
    private constructor(
        id: PostingId,
        private readonly _journalId: JournalId,
        private _timestamp: PostingTimestamp,
        private _result: PostingResult | null
    ) {
        super(id);
    }

    public static create(id: PostingId, journalId: JournalId): PostingTransaction {
        return new PostingTransaction(id, journalId, new PostingTimestamp(), null);
    }

    public static load(id: PostingId, journalId: JournalId, timestamp: PostingTimestamp, result: PostingResult | null): PostingTransaction {
        return new PostingTransaction(id, journalId, timestamp, result);
    }

    public get journalId(): JournalId { return this._journalId; }
    public get timestamp(): PostingTimestamp { return this._timestamp; }
    public get result(): PostingResult | null { return this._result; }

    public complete(): void {
        this._timestamp = new PostingTimestamp();
        this._result = new PostingResult(true);
    }

    public fail(reason: string): void {
        this._timestamp = new PostingTimestamp();
        this._result = new PostingResult(false, reason);
    }
}
""")

# Aggregate Root
create_file('src/domain/accounting/aggregates/PostingBatch.ts', """import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { PostingBatchId } from '../valueobjects/PostingBatchId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { PostingNumber } from '../valueobjects/PostingNumber';
import { PostingStatus } from '../valueobjects/PostingStatus';
import { PostingTimestamp } from '../valueobjects/PostingTimestamp';
import { PostingTransaction } from '../entities/PostingTransaction';
import { BusinessRuleError } from '../../shared/errors/BusinessRuleError';
import {
    JournalPostingStartedEvent,
    JournalPostedEvent,
    PostingCompletedEvent,
    PostingFailedEvent,
    PostingRolledBackEvent,
    PostingLockedEvent
} from '../events/PostingEvents';
import { JournalId } from '../valueobjects/JournalId';

export class PostingBatch extends AggregateRoot<PostingBatchId> {
    private constructor(
        id: PostingBatchId,
        private readonly _organizationId: OrganizationId,
        private _number: PostingNumber,
        private _status: PostingStatus,
        private _timestamp: PostingTimestamp,
        private _transactions: PostingTransaction[]
    ) {
        super(id);
    }

    public static create(
        id: PostingBatchId,
        organizationId: OrganizationId,
        number: PostingNumber
    ): PostingBatch {
        return new PostingBatch(
            id,
            organizationId,
            number,
            new PostingStatus('POSTING_REQUESTED'),
            new PostingTimestamp(),
            []
        );
    }

    public static load(
        id: PostingBatchId,
        organizationId: OrganizationId,
        number: PostingNumber,
        status: PostingStatus,
        timestamp: PostingTimestamp,
        transactions: PostingTransaction[]
    ): PostingBatch {
        return new PostingBatch(id, organizationId, number, status, timestamp, transactions);
    }

    public get organizationId(): OrganizationId { return this._organizationId; }
    public get number(): PostingNumber { return this._number; }
    public get status(): PostingStatus { return this._status; }
    public get timestamp(): PostingTimestamp { return this._timestamp; }
    public get transactions(): PostingTransaction[] { return [...this._transactions]; }

    public startPosting(journalId: JournalId, transactionId: string): void {
        if (this._status.value !== 'POSTING_REQUESTED' && this._status.value !== 'POSTING_RUNNING') {
            throw new BusinessRuleError('Cannot start posting in current state');
        }
        
        // Idempotency check inside batch
        if (this._transactions.some(t => t.journalId.value === journalId.value)) {
            throw new BusinessRuleError('Journal is already in this posting batch');
        }

        const tx = PostingTransaction.create(new (require('../valueobjects/PostingId').PostingId)(transactionId), journalId);
        this._transactions.push(tx);
        
        if (this._status.value !== 'POSTING_RUNNING') {
            this._status = new PostingStatus('POSTING_RUNNING');
        }

        this.addDomainEvent(new JournalPostingStartedEvent(this._organizationId, this.id, journalId));
    }

    public completeTransaction(journalId: JournalId): void {
        if (this._status.value !== 'POSTING_RUNNING') {
            throw new BusinessRuleError('Batch is not running');
        }
        const tx = this._transactions.find(t => t.journalId.value === journalId.value);
        if (!tx) throw new BusinessRuleError('Transaction not found in batch');
        
        tx.complete();
        this.addDomainEvent(new JournalPostedEvent(this._organizationId, this.id, journalId));
    }

    public failTransaction(journalId: JournalId, reason: string): void {
         if (this._status.value !== 'POSTING_RUNNING') {
            throw new BusinessRuleError('Batch is not running');
        }
        const tx = this._transactions.find(t => t.journalId.value === journalId.value);
        if (!tx) throw new BusinessRuleError('Transaction not found in batch');
        
        tx.fail(reason);
    }

    public completeBatch(): void {
        if (this._status.value !== 'POSTING_RUNNING') {
            throw new BusinessRuleError('Batch is not running');
        }
        
        const allCompleted = this._transactions.every(t => t.result && t.result.isSuccess);
        if (!allCompleted) {
            throw new BusinessRuleError('Cannot complete batch with incomplete or failed transactions');
        }

        this._status = new PostingStatus('POSTED');
        this._timestamp = new PostingTimestamp();
        this.addDomainEvent(new PostingCompletedEvent(this._organizationId, this.id));
    }

    public failBatch(reason: string): void {
        if (this._status.value === 'POSTED' || this._status.value === 'LOCKED' || this._status.value === 'ROLLED_BACK') {
            throw new BusinessRuleError('Cannot fail a batch that is already posted, locked, or rolled back');
        }
        this._status = new PostingStatus('FAILED');
        this.addDomainEvent(new PostingFailedEvent(this._organizationId, this.id, reason));
    }

    public rollbackBatch(): void {
        if (this._status.value !== 'FAILED') {
            throw new BusinessRuleError('Only failed batches can be rolled back');
        }
        this._status = new PostingStatus('ROLLED_BACK');
        this.addDomainEvent(new PostingRolledBackEvent(this._organizationId, this.id));
    }

    public lockBatch(): void {
        if (this._status.value !== 'POSTED') {
            throw new BusinessRuleError('Only posted batches can be locked');
        }
        this._status = new PostingStatus('LOCKED');
        this.addDomainEvent(new PostingLockedEvent(this._organizationId, this.id));
    }
}
""")

print("Posting Aggregate and Events created")
