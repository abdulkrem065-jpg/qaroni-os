import { Entity } from '../../shared/core/Entity';
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
