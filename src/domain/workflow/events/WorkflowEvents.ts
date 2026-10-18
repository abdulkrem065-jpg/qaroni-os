import { IDomainEvent } from '../../shared/core/IDomainEvent';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { WorkflowInstanceId } from '../valueobjects/WorkflowInstanceId';
import { WorkflowState } from '../valueobjects/WorkflowState';

export class WorkflowStartedEvent implements IDomainEvent {
    public eventName = "WorkflowStartedEvent";
    public occurredOn: Date;
    constructor(
        public readonly organizationId: OrganizationId,
        public readonly workflowInstanceId: WorkflowInstanceId,
        public readonly workflowId: string,
        public readonly entityId: string,
        public readonly entityType: string
    ) {
        this.occurredOn = new Date();
    }
}

export class WorkflowTransitionedEvent implements IDomainEvent {
    public eventName = "WorkflowTransitionedEvent";
    public occurredOn: Date;
    constructor(
        public readonly organizationId: OrganizationId,
        public readonly workflowInstanceId: WorkflowInstanceId,
        public readonly previousState: WorkflowState,
        public readonly newState: WorkflowState,
        public readonly action: string,
        public readonly actorId: string,
        public readonly reason?: string
    ) {
        this.occurredOn = new Date();
    }
}

export class WorkflowCompletedEvent implements IDomainEvent {
    public eventName = "WorkflowCompletedEvent";
    public occurredOn: Date;
    constructor(
        public readonly organizationId: OrganizationId,
        public readonly workflowInstanceId: WorkflowInstanceId,
        public readonly finalState: WorkflowState
    ) {
        this.occurredOn = new Date();
    }
}

export class WorkflowTaskCreatedEvent implements IDomainEvent {
    public eventName = "WorkflowTaskCreatedEvent";
    public occurredOn: Date;
    constructor(
        public readonly organizationId: OrganizationId,
        public readonly workflowInstanceId: WorkflowInstanceId,
        public readonly taskId: string,
        public readonly title: string,
        public readonly assignedRoles: string[],
        public readonly assignedUsers: string[]
    ) {
        this.occurredOn = new Date();
    }
}

export class WorkflowTaskCompletedEvent implements IDomainEvent {
    public eventName = "WorkflowTaskCompletedEvent";
    public occurredOn: Date;
    constructor(
        public readonly organizationId: OrganizationId,
        public readonly workflowInstanceId: WorkflowInstanceId,
        public readonly taskId: string,
        public readonly actorId: string
    ) {
        this.occurredOn = new Date();
    }
}

export class WorkflowRejectedEvent implements IDomainEvent {
    public eventName = "WorkflowRejectedEvent";
    public occurredOn: Date;
    constructor(
        public readonly organizationId: OrganizationId,
        public readonly workflowInstanceId: WorkflowInstanceId,
        public readonly rejectedBy: string,
        public readonly reason: string
    ) {
        this.occurredOn = new Date();
    }
}
