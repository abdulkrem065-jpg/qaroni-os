import { describe, it, expect } from 'vitest';
import { PostingBatch } from './PostingBatch';
import { PostingBatchId } from '../valueobjects/PostingBatchId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { PostingNumber } from '../valueobjects/PostingNumber';
import { JournalId } from '../valueobjects/JournalId';
import { BusinessRuleError } from '../../shared/errors/BusinessRuleError';
import * as crypto from 'crypto';

describe('PostingBatch Aggregate', () => {
    const orgId = new OrganizationId(crypto.randomUUID());

    it('should create a new PostingBatch in POSTING_REQUESTED status', () => {
        const batch = PostingBatch.create(
            new PostingBatchId(crypto.randomUUID()),
            orgId,
            new PostingNumber('PB-001')
        );

        expect(batch.status.value).toBe('POSTING_REQUESTED');
        expect(batch.transactions.length).toBe(0);
    });

    it('should allow starting and completing transactions', () => {
        const batch = PostingBatch.create(
            new PostingBatchId(crypto.randomUUID()),
            orgId,
            new PostingNumber('PB-001')
        );

        const journalId = new JournalId(crypto.randomUUID());
        batch.startPosting(journalId, crypto.randomUUID());

        expect(batch.status.value).toBe('POSTING_RUNNING');
        expect(batch.transactions.length).toBe(1);
        expect(batch.transactions[0].result).toBeNull();

        batch.completeTransaction(journalId);

        expect(batch.transactions[0].result?.isSuccess).toBe(true);
    });

    it('should complete the batch when all transactions succeed', () => {
        const batch = PostingBatch.create(
            new PostingBatchId(crypto.randomUUID()),
            orgId,
            new PostingNumber('PB-001')
        );

        const journalId = new JournalId(crypto.randomUUID());
        batch.startPosting(journalId, crypto.randomUUID());
        batch.completeTransaction(journalId);
        batch.completeBatch();

        expect(batch.status.value).toBe('POSTED');
    });

    it('should prevent batch completion if there is a failed transaction', () => {
        const batch = PostingBatch.create(
            new PostingBatchId(crypto.randomUUID()),
            orgId,
            new PostingNumber('PB-001')
        );

        const journalId = new JournalId(crypto.randomUUID());
        batch.startPosting(journalId, crypto.randomUUID());
        batch.failTransaction(journalId, 'Ledger connection lost');

        expect(() => batch.completeBatch()).toThrow(BusinessRuleError);
    });

    it('should handle batch failure and rollback', () => {
        const batch = PostingBatch.create(
            new PostingBatchId(crypto.randomUUID()),
            orgId,
            new PostingNumber('PB-001')
        );

        const journalId = new JournalId(crypto.randomUUID());
        batch.startPosting(journalId, crypto.randomUUID());
        
        batch.failBatch('Unexpected error');
        expect(batch.status.value).toBe('FAILED');

        batch.rollbackBatch();
        expect(batch.status.value).toBe('ROLLED_BACK');
    });

    it('should prevent duplicate journals in the same batch (idempotency)', () => {
        const batch = PostingBatch.create(
            new PostingBatchId(crypto.randomUUID()),
            orgId,
            new PostingNumber('PB-001')
        );

        const journalId = new JournalId(crypto.randomUUID());
        batch.startPosting(journalId, crypto.randomUUID());

        expect(() => batch.startPosting(journalId, crypto.randomUUID())).toThrow(BusinessRuleError);
    });
});
