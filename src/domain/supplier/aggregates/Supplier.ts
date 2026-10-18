import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { SupplierId } from '../../shared/valueobjects/SupplierId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { SupplierCode } from '../../shared/valueobjects/SupplierCode';
import { SupplierName } from '../../shared/valueobjects/SupplierName';
import { SupplierContact } from '../../shared/valueobjects/SupplierContact';
import { SupplierLegalInfo } from '../../shared/valueobjects/SupplierLegalInfo';
import { SupplierStatus } from '../types/SupplierTypes';
import { ValidationError } from '../../shared/errors/ValidationError';
import {
    SupplierCreatedEvent,
    SupplierUpdatedEvent,
    SupplierArchivedEvent,
    SupplierActivatedEvent,
    SupplierSuspendedEvent
} from '../events/SupplierEvents';

export class Supplier extends AggregateRoot<SupplierId> {
    private readonly _organizationId: OrganizationId;
    private _code: SupplierCode;
    private _name: SupplierName;
    private _contact: SupplierContact;
    private _legalInfo: SupplierLegalInfo;
    private _status: SupplierStatus;
    private readonly _createdAt: Date;
    private _updatedAt: Date;

    private constructor(
        id: SupplierId,
        organizationId: OrganizationId,
        code: SupplierCode,
        name: SupplierName,
        contact: SupplierContact,
        legalInfo: SupplierLegalInfo,
        status: SupplierStatus,
        createdAt: Date,
        updatedAt: Date
    ) {
        super(id);
        this._organizationId = organizationId;
        this._code = code;
        this._name = name;
        this._contact = contact;
        this._legalInfo = legalInfo;
        this._status = status;
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
    }

    public static create(
        id: SupplierId,
        organizationId: OrganizationId,
        code: SupplierCode,
        name: SupplierName,
        contact: SupplierContact,
        legalInfo: SupplierLegalInfo
    ): Supplier {
        const supplier = new Supplier(id, organizationId, code, name, contact, legalInfo, SupplierStatus.ACTIVE, new Date(), new Date());
        supplier.addDomainEvent(new SupplierCreatedEvent(id, organizationId));
        return supplier;
    }

    public static load(
        id: SupplierId,
        organizationId: OrganizationId,
        code: SupplierCode,
        name: SupplierName,
        contact: SupplierContact,
        legalInfo: SupplierLegalInfo,
        status: SupplierStatus,
        createdAt: Date,
        updatedAt: Date
    ): Supplier {
        return new Supplier(id, organizationId, code, name, contact, legalInfo, status, createdAt, updatedAt);
    }

    public updateDetails(name: SupplierName, contact: SupplierContact, legalInfo: SupplierLegalInfo): void {
        this.verifyNotArchived();
        this._name = name;
        this._contact = contact;
        this._legalInfo = legalInfo;
        this._updatedAt = new Date();
        this.addDomainEvent(new SupplierUpdatedEvent(this.id, this._organizationId));
    }

    public activate(): void {
        if (this._status === SupplierStatus.ARCHIVED) {
            throw new ValidationError('Cannot activate an archived supplier');
        }
        if (this._status !== SupplierStatus.ACTIVE) {
            this._status = SupplierStatus.ACTIVE;
            this._updatedAt = new Date();
            this.addDomainEvent(new SupplierActivatedEvent(this.id, this._organizationId));
        }
    }

    public suspend(): void {
        if (this._status === SupplierStatus.ARCHIVED) {
            throw new ValidationError('Cannot suspend an archived supplier');
        }
        if (this._status !== SupplierStatus.SUSPENDED) {
            this._status = SupplierStatus.SUSPENDED;
            this._updatedAt = new Date();
            this.addDomainEvent(new SupplierSuspendedEvent(this.id, this._organizationId));
        }
    }

    public archive(): void {
        if (this._status !== SupplierStatus.ARCHIVED) {
            this._status = SupplierStatus.ARCHIVED;
            this._updatedAt = new Date();
            this.addDomainEvent(new SupplierArchivedEvent(this.id, this._organizationId));
        }
    }

    public restore(): void {
        if (this._status === SupplierStatus.ARCHIVED) {
            this._status = SupplierStatus.SUSPENDED; // Restore to suspended state for safety
            this._updatedAt = new Date();
            this.addDomainEvent(new SupplierSuspendedEvent(this.id, this._organizationId));
        }
    }

    public canParticipateInTransactions(): boolean {
        return this._status === SupplierStatus.ACTIVE;
    }

    private verifyNotArchived(): void {
        if (this._status === SupplierStatus.ARCHIVED) {
            throw new ValidationError('Operation not allowed on archived supplier');
        }
    }

    public get organizationId(): OrganizationId { return this._organizationId; }
    public get code(): SupplierCode { return this._code; }
    public get name(): SupplierName { return this._name; }
    public get contact(): SupplierContact { return this._contact; }
    public get legalInfo(): SupplierLegalInfo { return this._legalInfo; }
    public get status(): SupplierStatus { return this._status; }
    public get createdAt(): Date { return this._createdAt; }
    public get updatedAt(): Date { return this._updatedAt; }
}
