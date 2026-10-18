import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { LedgerEntryId } from '../valueobjects/LedgerEntryId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { AccountId } from '../valueobjects/AccountId';
import { PostingBatchId } from '../valueobjects/PostingBatchId';
import { JournalId } from '../valueobjects/JournalId';
import { JournalLineId } from '../valueobjects/JournalLineId';
import { DebitAmount } from '../valueobjects/DebitAmount';
import { CreditAmount } from '../valueobjects/CreditAmount';
import { LedgerEntryCreatedEvent } from '../events/GeneralLedgerEvents';

export class LedgerEntry extends AggregateRoot<LedgerEntryId> {
    private constructor(
        id: LedgerEntryId,
        private readonly _organizationId: OrganizationId,
        private readonly _accountId: AccountId,
        private readonly _postingBatchId: PostingBatchId,
        private readonly _journalId: JournalId,
        private readonly _journalLineId: JournalLineId,
        private readonly _accountingDate: Date,
        private readonly _debit: DebitAmount,
        private readonly _credit: CreditAmount,
        private readonly _currencyId: string
    ) {
        super(id);
    }

    public static create(
        id: LedgerEntryId,
        organizationId: OrganizationId,
        accountId: AccountId,
        postingBatchId: PostingBatchId,
        journalId: JournalId,
        journalLineId: JournalLineId,
        accountingDate: Date,
        debit: DebitAmount,
        credit: CreditAmount,
        currencyId: string
    ): LedgerEntry {
        const entry = new LedgerEntry(
            id, organizationId, accountId, postingBatchId, journalId, journalLineId, accountingDate, debit, credit, currencyId
        );
        entry.addDomainEvent(new LedgerEntryCreatedEvent(organizationId, id));
        return entry;
    }

    public static load(
        id: LedgerEntryId,
        organizationId: OrganizationId,
        accountId: AccountId,
        postingBatchId: PostingBatchId,
        journalId: JournalId,
        journalLineId: JournalLineId,
        accountingDate: Date,
        debit: DebitAmount,
        credit: CreditAmount,
        currencyId: string
    ): LedgerEntry {
        return new LedgerEntry(id, organizationId, accountId, postingBatchId, journalId, journalLineId, accountingDate, debit, credit, currencyId);
    }

    public get organizationId(): OrganizationId { return this._organizationId; }
    public get accountId(): AccountId { return this._accountId; }
    public get postingBatchId(): PostingBatchId { return this._postingBatchId; }
    public get journalId(): JournalId { return this._journalId; }
    public get journalLineId(): JournalLineId { return this._journalLineId; }
    public get accountingDate(): Date { return this._accountingDate; }
    public get debit(): DebitAmount { return this._debit; }
    public get credit(): CreditAmount { return this._credit; }
    public get currencyId(): string { return this._currencyId; }
}
