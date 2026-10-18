import { IDomainEvent } from '../../shared/core/IDomainEvent';
import { BranchId } from '../../shared/valueobjects/BranchId';

export class BranchArchivedEvent implements IDomainEvent {
    public readonly eventName = 'BranchArchivedEvent';
    public readonly occurredOn: Date;

    constructor(
        public readonly branchId: BranchId
    ) {
        this.occurredOn = new Date();
    }
}
