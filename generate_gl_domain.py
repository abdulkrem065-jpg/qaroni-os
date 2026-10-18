import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

# Value Objects
create_file('src/domain/accounting/valueobjects/LedgerEntryId.ts', """import { EntityId } from '../../shared/valueobjects/EntityId';
export class LedgerEntryId extends EntityId {}
""")

create_file('src/domain/accounting/valueobjects/LedgerBalanceId.ts', """import { EntityId } from '../../shared/valueobjects/EntityId';
export class LedgerBalanceId extends EntityId {}
""")

create_file('src/domain/accounting/valueobjects/LedgerPeriod.ts', """import { ValidationError } from '../../shared/errors/ValidationError';
export class LedgerPeriod {
    public readonly value: string;
    constructor(value: string) {
        // e.g., '2026-07'
        if (!/^\d{4}-\d{2}$/.test(value)) throw new ValidationError('LedgerPeriod must be in YYYY-MM format');
        this.value = value;
        Object.freeze(this);
    }
}
""")

# Events
create_file('src/domain/accounting/events/GeneralLedgerEvents.ts', """import { IDomainEvent } from '../../shared/core/IDomainEvent';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { LedgerEntryId } from '../valueobjects/LedgerEntryId';
import { LedgerBalanceId } from '../valueobjects/LedgerBalanceId';

export class LedgerEntryCreatedEvent implements IDomainEvent {
    public readonly occurredOn: Date = new Date();
    public readonly eventName: string = this.constructor.name;
    constructor(public readonly organizationId: OrganizationId, public readonly ledgerEntryId: LedgerEntryId) {}
}

export class LedgerBalanceUpdatedEvent implements IDomainEvent {
    public readonly occurredOn: Date = new Date();
    public readonly eventName: string = this.constructor.name;
    constructor(public readonly organizationId: OrganizationId, public readonly ledgerBalanceId: LedgerBalanceId) {}
}
""")

# Aggregates
create_file('src/domain/accounting/aggregates/LedgerEntry.ts', """import { AggregateRoot } from '../../shared/core/AggregateRoot';
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
""")

create_file('src/domain/accounting/aggregates/LedgerBalance.ts', """import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { LedgerBalanceId } from '../valueobjects/LedgerBalanceId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { AccountId } from '../valueobjects/AccountId';
import { LedgerPeriod } from '../valueobjects/LedgerPeriod';
import { DebitAmount } from '../valueobjects/DebitAmount';
import { CreditAmount } from '../valueobjects/CreditAmount';
import { LedgerBalanceUpdatedEvent } from '../events/GeneralLedgerEvents';

export class LedgerBalance extends AggregateRoot<LedgerBalanceId> {
    private constructor(
        id: LedgerBalanceId,
        private readonly _organizationId: OrganizationId,
        private readonly _accountId: AccountId,
        private readonly _period: LedgerPeriod,
        private _totalDebit: DebitAmount,
        private _totalCredit: CreditAmount,
        private _currencyId: string
    ) {
        super(id);
    }

    public static create(
        id: LedgerBalanceId,
        organizationId: OrganizationId,
        accountId: AccountId,
        period: LedgerPeriod,
        currencyId: string
    ): LedgerBalance {
        return new LedgerBalance(
            id, organizationId, accountId, period, new DebitAmount(0), new CreditAmount(0), currencyId
        );
    }

    public static load(
        id: LedgerBalanceId,
        organizationId: OrganizationId,
        accountId: AccountId,
        period: LedgerPeriod,
        totalDebit: DebitAmount,
        totalCredit: CreditAmount,
        currencyId: string
    ): LedgerBalance {
        return new LedgerBalance(id, organizationId, accountId, period, totalDebit, totalCredit, currencyId);
    }

    public get organizationId(): OrganizationId { return this._organizationId; }
    public get accountId(): AccountId { return this._accountId; }
    public get period(): LedgerPeriod { return this._period; }
    public get totalDebit(): DebitAmount { return this._totalDebit; }
    public get totalCredit(): CreditAmount { return this._totalCredit; }
    public get currencyId(): string { return this._currencyId; }

    public addTransaction(debit: number, credit: number): void {
        this._totalDebit = new DebitAmount(this._totalDebit.value + debit);
        this._totalCredit = new CreditAmount(this._totalCredit.value + credit);
        this.addDomainEvent(new LedgerBalanceUpdatedEvent(this._organizationId, this.id));
    }
}
""")

print("General Ledger Domain logic created")
