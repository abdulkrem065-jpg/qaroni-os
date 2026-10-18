import { IDomainEvent } from '../../shared/core/IDomainEvent';
import { StaffId } from '../../shared/valueobjects/StaffId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { BranchId } from '../../shared/valueobjects/BranchId';
import { RoleId } from '../../iam/value-objects/RoleId';

export class StaffCreatedEvent implements IDomainEvent {
    public readonly eventName = 'StaffCreatedEvent';
    public readonly occurredOn: Date = new Date();
    constructor(public readonly staffId: StaffId, public readonly organizationId: OrganizationId, public readonly branchId: BranchId) {}
}

export class StaffUpdatedEvent implements IDomainEvent {
    public readonly eventName = 'StaffUpdatedEvent';
    public readonly occurredOn: Date = new Date();
    constructor(public readonly staffId: StaffId) {}
}

export class StaffActivatedEvent implements IDomainEvent {
    public readonly eventName = 'StaffActivatedEvent';
    public readonly occurredOn: Date = new Date();
    constructor(public readonly staffId: StaffId) {}
}

export class StaffSuspendedEvent implements IDomainEvent {
    public readonly eventName = 'StaffSuspendedEvent';
    public readonly occurredOn: Date = new Date();
    constructor(public readonly staffId: StaffId) {}
}

export class StaffArchivedEvent implements IDomainEvent {
    public readonly eventName = 'StaffArchivedEvent';
    public readonly occurredOn: Date = new Date();
    constructor(public readonly staffId: StaffId) {}
}

export class StaffTransferredEvent implements IDomainEvent {
    public readonly eventName = 'StaffTransferredEvent';
    public readonly occurredOn: Date = new Date();
    constructor(public readonly staffId: StaffId, public readonly newBranchId: BranchId) {}
}

export class StaffRoleAssignedEvent implements IDomainEvent {
    public readonly eventName = 'StaffRoleAssignedEvent';
    public readonly occurredOn: Date = new Date();
    constructor(public readonly staffId: StaffId, public readonly roleId: RoleId) {}
}

export class StaffRoleRemovedEvent implements IDomainEvent {
    public readonly eventName = 'StaffRoleRemovedEvent';
    public readonly occurredOn: Date = new Date();
    constructor(public readonly staffId: StaffId, public readonly roleId: RoleId) {}
}
