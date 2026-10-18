import { IDomainEvent } from '../../shared/core/IDomainEvent';
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
