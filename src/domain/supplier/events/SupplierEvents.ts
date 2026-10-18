import { IDomainEvent } from '../../shared/core/IDomainEvent';
import { SupplierId } from '../../shared/valueobjects/SupplierId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export class SupplierCreatedEvent implements IDomainEvent {
    public readonly eventName = 'SupplierCreatedEvent';
    public readonly occurredOn: Date = new Date();
    constructor(
        public readonly supplierId: SupplierId,
        public readonly organizationId: OrganizationId
    ) {}
}

export class SupplierUpdatedEvent implements IDomainEvent {
    public readonly eventName = 'SupplierUpdatedEvent';
    public readonly occurredOn: Date = new Date();
    constructor(
        public readonly supplierId: SupplierId,
        public readonly organizationId: OrganizationId
    ) {}
}

export class SupplierArchivedEvent implements IDomainEvent {
    public readonly eventName = 'SupplierArchivedEvent';
    public readonly occurredOn: Date = new Date();
    constructor(
        public readonly supplierId: SupplierId,
        public readonly organizationId: OrganizationId
    ) {}
}

export class SupplierActivatedEvent implements IDomainEvent {
    public readonly eventName = 'SupplierActivatedEvent';
    public readonly occurredOn: Date = new Date();
    constructor(
        public readonly supplierId: SupplierId,
        public readonly organizationId: OrganizationId
    ) {}
}

export class SupplierSuspendedEvent implements IDomainEvent {
    public readonly eventName = 'SupplierSuspendedEvent';
    public readonly occurredOn: Date = new Date();
    constructor(
        public readonly supplierId: SupplierId,
        public readonly organizationId: OrganizationId
    ) {}
}
