import { IDomainEvent } from '../../shared/core/IDomainEvent';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export class OrganizationSettingsUpdatedEvent implements IDomainEvent {
    public readonly eventName = 'OrganizationSettingsUpdatedEvent';
    public readonly occurredOn: Date;

    constructor(
        public readonly organizationId: OrganizationId,
        public readonly taxId?: string,
        public readonly timezone?: string,
        public readonly currency?: string
    ) {
        this.occurredOn = new Date();
    }
}
