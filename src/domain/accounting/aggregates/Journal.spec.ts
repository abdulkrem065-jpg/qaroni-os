import { describe, it, expect } from 'vitest';
import { Journal } from './Journal';
import { JournalId } from '../valueobjects/JournalId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { JournalNumber } from '../valueobjects/JournalNumber';
import { JournalDescription } from '../valueobjects/JournalDescription';
import { PostingDate } from '../valueobjects/PostingDate';
import { AccountingDate } from '../valueobjects/AccountingDate';
import { ReferenceNumber } from '../valueobjects/ReferenceNumber';
import { JournalLine } from '../entities/JournalLine';
import { JournalLineId } from '../valueobjects/JournalLineId';
import { AccountId } from '../valueobjects/AccountId';
import { DebitAmount } from '../valueobjects/DebitAmount';
import { CreditAmount } from '../valueobjects/CreditAmount';
import { BusinessRuleError } from '../../shared/errors/BusinessRuleError';
import * as crypto from 'crypto';

describe('Journal Aggregate', () => {
    const orgId = new OrganizationId(crypto.randomUUID());
    const account1 = new AccountId(crypto.randomUUID());
    const account2 = new AccountId(crypto.randomUUID());

    it('should create a valid DRAFT Journal', () => {
        const journal = Journal.create(
            new JournalId(crypto.randomUUID()),
            orgId,
            new JournalNumber('J-100'),
            new JournalDescription('Test journal'),
            new PostingDate('2026-07-29'),
            new AccountingDate('2026-07-29'),
            new ReferenceNumber('REF-01')
        );

        expect(journal.status.value).toBe('DRAFT');
        expect(journal.number.value).toBe('J-100');
        expect(journal.domainEvents.length).toBe(1); // JournalCreatedEvent
    });

    it('should allow adding lines in DRAFT status', () => {
        const journal = Journal.create(
            new JournalId(crypto.randomUUID()),
            orgId,
            new JournalNumber('J-100'),
            new JournalDescription('Test journal'),
            new PostingDate('2026-07-29'),
            new AccountingDate('2026-07-29'),
            new ReferenceNumber('REF-01')
        );

        journal.addLine(JournalLine.create(
            new JournalLineId(crypto.randomUUID()),
            account1,
            new JournalDescription('Debit line'),
            new DebitAmount(100),
            new CreditAmount(0),
            'USD'
        ));

        expect(journal.lines.length).toBe(1);
    });

    it('should validate balance before requesting approval', () => {
        const journal = Journal.create(
            new JournalId(crypto.randomUUID()),
            orgId,
            new JournalNumber('J-100'),
            new JournalDescription('Test journal'),
            new PostingDate('2026-07-29'),
            new AccountingDate('2026-07-29'),
            new ReferenceNumber('REF-01')
        );

        // Less than 2 lines
        expect(() => journal.requestApproval()).toThrow(BusinessRuleError);

        journal.addLine(JournalLine.create(
            new JournalLineId(crypto.randomUUID()),
            account1,
            new JournalDescription('Debit line'),
            new DebitAmount(100),
            new CreditAmount(0),
            'USD'
        ));

        journal.addLine(JournalLine.create(
            new JournalLineId(crypto.randomUUID()),
            account2,
            new JournalDescription('Credit line'),
            new DebitAmount(0),
            new CreditAmount(90), // Imbalanced
            'USD'
        ));

        expect(() => journal.requestApproval()).toThrow(BusinessRuleError);

        journal.removeLine(journal.lines[1].id.value);

        journal.addLine(JournalLine.create(
            new JournalLineId(crypto.randomUUID()),
            account2,
            new JournalDescription('Credit line'),
            new DebitAmount(0),
            new CreditAmount(100), // Balanced
            'USD'
        ));

        journal.requestApproval();
        expect(journal.status.value).toBe('READY_FOR_APPROVAL');
    });

    it('should prevent modification after approval', () => {
        const journal = Journal.create(
            new JournalId(crypto.randomUUID()),
            orgId,
            new JournalNumber('J-100'),
            new JournalDescription('Test journal'),
            new PostingDate('2026-07-29'),
            new AccountingDate('2026-07-29'),
            new ReferenceNumber('REF-01')
        );

        journal.addLine(JournalLine.create(
            new JournalLineId(crypto.randomUUID()),
            account1,
            new JournalDescription('Debit line'),
            new DebitAmount(100),
            new CreditAmount(0),
            'USD'
        ));

        journal.addLine(JournalLine.create(
            new JournalLineId(crypto.randomUUID()),
            account2,
            new JournalDescription('Credit line'),
            new DebitAmount(0),
            new CreditAmount(100),
            'USD'
        ));

        journal.requestApproval();
        journal.approve();

        expect(journal.status.value).toBe('APPROVED');

        expect(() => journal.addLine(JournalLine.create(
            new JournalLineId(crypto.randomUUID()),
            account1,
            new JournalDescription('Debit line'),
            new DebitAmount(50),
            new CreditAmount(0),
            'USD'
        ))).toThrow(BusinessRuleError);
    });
});
