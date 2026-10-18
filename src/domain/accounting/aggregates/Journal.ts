import { AggregateRoot } from '../../shared/core/AggregateRoot';
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
import { DoubleEntryEngine } from '../services/DoubleEntryEngine';

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
        if (this._status.isPosted() || this._status.isApproved()) {
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
        DoubleEntryEngine.validateJournal(this);
    }
}
