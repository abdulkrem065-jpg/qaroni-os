import { IDomainEvent } from '../../shared/core/IDomainEvent';
import { BranchId } from '../../shared/valueobjects/BranchId';

export class BranchActivatedEvent implements IDomainEvent {
    public readonly eventName = 'BranchActivatedEvent';
    public readonly occurredOn: Date;

    constructor(
        public readonly branchId: BranchId
    ) {
        this.occurredOn = new Date();
    }
}
