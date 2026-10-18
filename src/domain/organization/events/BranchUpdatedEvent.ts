import { IDomainEvent } from '../../shared/core/IDomainEvent';
import { BranchId } from '../../shared/valueobjects/BranchId';

export class BranchUpdatedEvent implements IDomainEvent {
    public readonly eventName = 'BranchUpdatedEvent';
    public readonly occurredOn: Date;

    constructor(
        public readonly branchId: BranchId
    ) {
        this.occurredOn = new Date();
    }
}
