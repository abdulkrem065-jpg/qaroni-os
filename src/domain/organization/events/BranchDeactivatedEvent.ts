import { IDomainEvent } from '../../shared/core/IDomainEvent';
import { BranchId } from '../../shared/valueobjects/BranchId';

export class BranchDeactivatedEvent implements IDomainEvent {
    public readonly eventName = 'BranchDeactivatedEvent';
    public readonly occurredOn: Date;

    constructor(
        public readonly branchId: BranchId
    ) {
        this.occurredOn = new Date();
    }
}
