import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { WorkflowInstanceId } from '../valueobjects/WorkflowInstanceId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { WorkflowId } from '../valueobjects/WorkflowId';
import { WorkflowState } from '../valueobjects/WorkflowState';
import { WorkflowTask } from '../entities/WorkflowTask';
import { TaskId } from '../valueobjects/TaskId';
import { BusinessRuleError } from '../../shared/errors/BusinessRuleError';
import { 
    WorkflowStartedEvent, 
    WorkflowTransitionedEvent, 
    WorkflowCompletedEvent,
    WorkflowTaskCreatedEvent,
    WorkflowTaskCompletedEvent,
    WorkflowRejectedEvent
} from '../events/WorkflowEvents';

export class WorkflowInstance extends AggregateRoot<WorkflowInstanceId> {
    private constructor(
        id: WorkflowInstanceId,
        private _organizationId: OrganizationId,
        private _workflowId: WorkflowId,
        private _entityId: string,
        private _entityType: string,
        private _currentState: WorkflowState,
        private _tasks: WorkflowTask[],
        private _context: Record<string, any>,
        private _status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'REJECTED'
    ) {
        super(id);
    }

    public static create(
        id: WorkflowInstanceId,
        organizationId: OrganizationId,
        workflowId: WorkflowId,
        entityId: string,
        entityType: string,
        initialState: WorkflowState,
        context: Record<string, any> = {}
    ): WorkflowInstance {
        const instance = new WorkflowInstance(
            id,
            organizationId,
            workflowId,
            entityId,
            entityType,
            initialState,
            [],
            context,
            'ACTIVE'
        );
        instance.addDomainEvent(new WorkflowStartedEvent(organizationId, id, workflowId.value, entityId, entityType));
        return instance;
    }

    public static load(
        id: WorkflowInstanceId,
        organizationId: OrganizationId,
        workflowId: WorkflowId,
        entityId: string,
        entityType: string,
        currentState: WorkflowState,
        tasks: WorkflowTask[],
        context: Record<string, any>,
        status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'REJECTED'
    ): WorkflowInstance {
        return new WorkflowInstance(id, organizationId, workflowId, entityId, entityType, currentState, tasks, context, status);
    }

    get organizationId(): OrganizationId { return this._organizationId; }
    get workflowId(): WorkflowId { return this._workflowId; }
    get entityId(): string { return this._entityId; }
    get entityType(): string { return this._entityType; }
    get currentState(): WorkflowState { return this._currentState; }
    get tasks(): ReadonlyArray<WorkflowTask> { return this._tasks; }
    get context(): Record<string, any> { return { ...this._context }; }
    get status(): string { return this._status; }

    public getPendingTasks(): WorkflowTask[] {
        return this._tasks.filter(t => t.status === 'PENDING' || t.status === 'ASSIGNED');
    }

    public transition(
        newState: WorkflowState, 
        action: string, 
        actorId: string, 
        reason?: string,
        isFinalState: boolean = false
    ): void {
        if (this._status !== 'ACTIVE') {
            throw new BusinessRuleError('Cannot transition a non-active workflow instance');
        }

        const previousState = this._currentState;
        this._currentState = newState;

        this.addDomainEvent(new WorkflowTransitionedEvent(
            this._organizationId,
            this.id,
            previousState,
            newState,
            action,
            actorId,
            reason
        ));

        if (isFinalState) {
            this._status = 'COMPLETED';
            this.addDomainEvent(new WorkflowCompletedEvent(this._organizationId, this.id, newState));
            this.cancelPendingTasks();
        }
    }

    public updateContext(key: string, value: any): void {
        this._context[key] = value;
    }

    public addTask(task: WorkflowTask): void {
        this._tasks.push(task);
        this.addDomainEvent(new WorkflowTaskCreatedEvent(
            this._organizationId,
            this.id,
            task.id.value,
            task.title,
            task.assignedRoles,
            task.assignedUsers
        ));
    }

    public completeTask(taskId: TaskId, actorId: string): void {
        const task = this._tasks.find(t => t.id.equals(taskId));
        if (!task) throw new BusinessRuleError('Task not found in this workflow instance');

        if (task.status !== 'PENDING' && task.status !== 'ASSIGNED') {
            throw new BusinessRuleError(`Cannot complete task in status ${task.status}`);
        }

        task.complete(actorId);
        this.addDomainEvent(new WorkflowTaskCompletedEvent(
            this._organizationId,
            this.id,
            task.id.value,
            actorId
        ));
    }

    public reject(actorId: string, reason: string): void {
        if (this._status !== 'ACTIVE') {
            throw new BusinessRuleError('Cannot reject a non-active workflow instance');
        }

        this._status = 'REJECTED';
        this.addDomainEvent(new WorkflowRejectedEvent(
            this._organizationId,
            this.id,
            actorId,
            reason
        ));
        this.cancelPendingTasks();
    }

    public cancel(): void {
        if (this._status !== 'ACTIVE') {
            throw new BusinessRuleError('Cannot cancel a non-active workflow instance');
        }
        this._status = 'CANCELLED';
        this.cancelPendingTasks();
    }

    private cancelPendingTasks(): void {
        for (const task of this.getPendingTasks()) {
            task.cancel();
        }
    }
}
