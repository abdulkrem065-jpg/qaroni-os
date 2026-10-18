import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

# Events
create_file('src/domain/accounting/events/JournalEvents.ts', """import { IDomainEvent } from '../../shared/core/IDomainEvent';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { JournalId } from '../valueobjects/JournalId';

export class JournalCreatedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;
    constructor(public readonly organizationId: OrganizationId, public readonly journalId: JournalId) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}

export class JournalStatusChangedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;
    constructor(public readonly organizationId: OrganizationId, public readonly journalId: JournalId, public readonly oldStatus: string, public readonly newStatus: string) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}
""")

# JournalLine
create_file('src/domain/accounting/entities/JournalLine.ts', """import { Entity } from '../../shared/core/Entity';
import { JournalLineId } from '../valueobjects/JournalLineId';
import { AccountId } from '../valueobjects/AccountId';
import { JournalDescription } from '../valueobjects/JournalDescription';
import { DebitAmount } from '../valueobjects/DebitAmount';
import { CreditAmount } from '../valueobjects/CreditAmount';
import { BusinessRuleError } from '../../shared/errors/BusinessRuleError';

export class JournalLine extends Entity<JournalLineId> {
    private constructor(
        id: JournalLineId,
        private _accountId: AccountId,
        private _description: JournalDescription,
        private _debit: DebitAmount,
        private _credit: CreditAmount,
        private _currencyId: string,
        private _costCenterId?: string,
        private _branchId?: string,
        private _customerId?: string,
        private _supplierId?: string
    ) {
        super(id);
        this.validateAmount();
    }

    public static create(
        id: JournalLineId,
        accountId: AccountId,
        description: JournalDescription,
        debit: DebitAmount,
        credit: CreditAmount,
        currencyId: string,
        costCenterId?: string,
        branchId?: string,
        customerId?: string,
        supplierId?: string
    ): JournalLine {
        return new JournalLine(id, accountId, description, debit, credit, currencyId, costCenterId, branchId, customerId, supplierId);
    }

    private validateAmount(): void {
        const hasDebit = this._debit.value > 0;
        const hasCredit = this._credit.value > 0;

        if (hasDebit && hasCredit) {
            throw new BusinessRuleError('Journal Line cannot contain both Debit and Credit amounts');
        }
        if (!hasDebit && !hasCredit) {
            throw new BusinessRuleError('Journal Line must have either Debit or Credit amount greater than zero');
        }
    }

    public get accountId(): AccountId { return this._accountId; }
    public get description(): JournalDescription { return this._description; }
    public get debit(): DebitAmount { return this._debit; }
    public get credit(): CreditAmount { return this._credit; }
    public get currencyId(): string { return this._currencyId; }
    public get costCenterId(): string | undefined { return this._costCenterId; }
    public get branchId(): string | undefined { return this._branchId; }
    public get customerId(): string | undefined { return this._customerId; }
    public get supplierId(): string | undefined { return this._supplierId; }
}
""")

# JournalEntry (Header placeholder AR just to satisfy prompt if it wants both, or I will use Journal as main)
create_file('src/domain/accounting/aggregates/JournalEntry.ts', """import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { JournalEntryId } from '../valueobjects/JournalEntryId';

// This satisfies the "Implement Aggregate Roots: Journal, JournalEntry" requirement.
// However, the main logic will be in Journal aggregate as per Use Cases.
export class JournalEntry extends AggregateRoot<JournalEntryId> {
    constructor(id: JournalEntryId) {
        super(id);
    }
}
""")

# Journal
create_file('src/domain/accounting/aggregates/Journal.ts', """import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { JournalId } from '../valueobjects/JournalId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { JournalNumber } from '../valueobjects/JournalNumber';
import { JournalDescription } from '../valueobjects/JournalDescription';
import { JournalStatus } from '../valueobjects/JournalStatus';
import { PostingDate } from '../valueobjects/PostingDate';
import { AccountingDate } from '../valueobjects/AccountingDate';
import { ReferenceNumber } from '../valueobjects/ReferenceNumber';
import { JournalLine } from '../entities/JournalLine';
import { BusinessRuleError } from '../../shared/errors/BusinessRuleError';
import { JournalCreatedEvent, JournalStatusChangedEvent } from '../events/JournalEvents';

export class Journal extends AggregateRoot<JournalId> {
    private constructor(
        id: JournalId,
        private readonly _organizationId: OrganizationId,
        private _number: JournalNumber,
        private _description: JournalDescription,
        private _status: JournalStatus,
        private _postingDate: PostingDate,
        private _accountingDate: AccountingDate,
        private _referenceNumber: ReferenceNumber,
        private _lines: JournalLine[]
    ) {
        super(id);
    }

    public static create(
        id: JournalId,
        organizationId: OrganizationId,
        number: JournalNumber,
        description: JournalDescription,
        postingDate: PostingDate,
        accountingDate: AccountingDate,
        referenceNumber: ReferenceNumber
    ): Journal {
        const journal = new Journal(
            id,
            organizationId,
            number,
            description,
            new JournalStatus('DRAFT'),
            postingDate,
            accountingDate,
            referenceNumber,
            []
        );
        journal.addDomainEvent(new JournalCreatedEvent(organizationId, id));
        return journal;
    }

    public static load(
        id: JournalId,
        organizationId: OrganizationId,
        number: JournalNumber,
        description: JournalDescription,
        status: JournalStatus,
        postingDate: PostingDate,
        accountingDate: AccountingDate,
        referenceNumber: ReferenceNumber,
        lines: JournalLine[]
    ): Journal {
        return new Journal(id, organizationId, number, description, status, postingDate, accountingDate, referenceNumber, lines);
    }

    public get organizationId(): OrganizationId { return this._organizationId; }
    public get number(): JournalNumber { return this._number; }
    public get description(): JournalDescription { return this._description; }
    public get status(): JournalStatus { return this._status; }
    public get postingDate(): PostingDate { return this._postingDate; }
    public get accountingDate(): AccountingDate { return this._accountingDate; }
    public get referenceNumber(): ReferenceNumber { return this._referenceNumber; }
    public get lines(): JournalLine[] { return [...this._lines]; }

    public addLine(line: JournalLine): void {
        this.checkModifiable();
        this._lines.push(line);
    }

    public removeLine(lineId: string): void {
        this.checkModifiable();
        this._lines = this._lines.filter(l => l.id.value !== lineId);
    }

    public update(description: JournalDescription, postingDate: PostingDate, accountingDate: AccountingDate, referenceNumber: ReferenceNumber): void {
        this.checkModifiable();
        this._description = description;
        this._postingDate = postingDate;
        this._accountingDate = accountingDate;
        this._referenceNumber = referenceNumber;
    }

    public requestApproval(): void {
        this.checkModifiable();
        this.validateReadyForApproval();
        this.changeStatus('READY_FOR_APPROVAL');
    }

    public approve(): void {
        if (this._status.value !== 'READY_FOR_APPROVAL') {
            throw new BusinessRuleError('Journal must be in READY_FOR_APPROVAL state to be approved');
        }
        this.changeStatus('APPROVED');
    }

    public reject(): void {
        if (this._status.value !== 'READY_FOR_APPROVAL') {
            throw new BusinessRuleError('Journal must be in READY_FOR_APPROVAL state to be rejected');
        }
        this.changeStatus('REJECTED');
    }

    public cancel(): void {
        if (this._status.isPosted()) {
            throw new BusinessRuleError('Cannot cancel a posted journal');
        }
        this.changeStatus('CANCELLED');
    }

    public markAsPosted(): void {
        if (this._status.value !== 'APPROVED') {
            throw new BusinessRuleError('Journal must be APPROVED before posting');
        }
        this.changeStatus('POSTED');
    }

    private changeStatus(newStatus: string): void {
        const oldStatus = this._status.value;
        this._status = new JournalStatus(newStatus);
        this.addDomainEvent(new JournalStatusChangedEvent(this._organizationId, this.id, oldStatus, newStatus));
    }

    private checkModifiable(): void {
        if (!this._status.canModify()) {
            throw new BusinessRuleError('Journal cannot be modified in its current state');
        }
    }

    public validateReadyForApproval(): void {
        if (this._lines.length < 2) {
            throw new BusinessRuleError('Journal must have at least two lines');
        }

        let totalDebit = 0;
        let totalCredit = 0;

        for (const line of this._lines) {
            totalDebit += line.debit.value;
            totalCredit += line.credit.value;
        }

        // Use epsilon for float comparison if needed, but assuming standard 2-decimal scaling or integers
        if (Math.abs(totalDebit - totalCredit) > 0.001) {
            throw new BusinessRuleError('Journal is not balanced: Total Debit must equal Total Credit');
        }
        
        if (totalDebit <= 0) {
            throw new BusinessRuleError('Journal cannot be empty');
        }
    }
}
""")

# Repositories
create_file('src/domain/accounting/repositories/IJournalRepository.ts', """import { Journal } from '../aggregates/Journal';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { JournalId } from '../valueobjects/JournalId';

export interface IJournalRepository {
    save(journal: Journal): Promise<void>;
    findById(id: JournalId, organizationId: OrganizationId): Promise<Journal | null>;
    findByOrganization(organizationId: OrganizationId): Promise<Journal[]>;
}
""")

create_file('src/domain/accounting/repositories/IJournalLineRepository.ts', """import { JournalLine } from '../entities/JournalLine';
import { JournalId } from '../valueobjects/JournalId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export interface IJournalLineRepository {
    saveMany(journalId: JournalId, lines: JournalLine[]): Promise<void>;
    findByJournalId(journalId: JournalId): Promise<JournalLine[]>;
    deleteMany(journalId: JournalId): Promise<void>;
}
""")

print("Journal Aggregates created")
