import { IDomainEvent } from '../../shared/core/IDomainEvent';
import { BranchId } from '../../shared/valueobjects/BranchId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { BranchCode } from '../../shared/valueobjects/BranchCode';

export class BranchCreatedEvent implements IDomainEvent {
    public readonly eventName = 'BranchCreatedEvent';
    public readonly occurredOn: Date;

    constructor(
        public readonly branchId: BranchId,
        public readonly organizationId: OrganizationId,
        public readonly branchCode: BranchCode
    ) {
        this.occurredOn = new Date();
    }
}
