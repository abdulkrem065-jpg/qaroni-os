import { IDomainEvent } from '../../shared/core/IDomainEvent';
import { ProductId } from '../../shared/valueobjects/ProductId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export class ProductCreatedEvent implements IDomainEvent {
    public readonly eventName = 'ProductCreatedEvent';
    public readonly occurredOn: Date = new Date();
    constructor(public readonly productId: ProductId, public readonly organizationId: OrganizationId) {}
}

export class ProductUpdatedEvent implements IDomainEvent {
    public readonly eventName = 'ProductUpdatedEvent';
    public readonly occurredOn: Date = new Date();
    constructor(public readonly productId: ProductId) {}
}

export class ProductArchivedEvent implements IDomainEvent {
    public readonly eventName = 'ProductArchivedEvent';
    public readonly occurredOn: Date = new Date();
    constructor(public readonly productId: ProductId) {}
}

export class ProductRestoredEvent implements IDomainEvent {
    public readonly eventName = 'ProductRestoredEvent';
    public readonly occurredOn: Date = new Date();
    constructor(public readonly productId: ProductId) {}
}
