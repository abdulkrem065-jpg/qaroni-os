import { Entity } from '../../shared/core/Entity';
import { TaskId } from '../valueobjects/TaskId';
import { WorkflowInstanceId } from '../valueobjects/WorkflowInstanceId';

export type TaskStatus = 'PENDING' | 'ASSIGNED' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';

export class WorkflowTask extends Entity<TaskId> {
    private constructor(
        id: TaskId,
        private _workflowInstanceId: WorkflowInstanceId,
        private _title: string,
        private _assignedRoles: string[],
        private _assignedUsers: string[],
        private _status: TaskStatus,
        private _createdAt: Date,
        private _expiresAt?: Date,
        private _completedAt?: Date,
        private _completedBy?: string
    ) {
        super(id);
    }

    public static create(
        id: TaskId,
        workflowInstanceId: WorkflowInstanceId,
        title: string,
        assignedRoles: string[],
        assignedUsers: string[],
        expiresAt?: Date
    ): WorkflowTask {
        return new WorkflowTask(
            id,
            workflowInstanceId,
            title,
            assignedRoles,
            assignedUsers,
            'PENDING',
            new Date(),
            expiresAt
        );
    }

    public static load(
        id: TaskId,
        workflowInstanceId: WorkflowInstanceId,
        title: string,
        assignedRoles: string[],
        assignedUsers: string[],
        status: TaskStatus,
        createdAt: Date,
        expiresAt?: Date,
        completedAt?: Date,
        completedBy?: string
    ): WorkflowTask {
        return new WorkflowTask(id, workflowInstanceId, title, assignedRoles, assignedUsers, status, createdAt, expiresAt, completedAt, completedBy);
    }

    get workflowInstanceId(): WorkflowInstanceId { return this._workflowInstanceId; }
    get title(): string { return this._title; }
    get assignedRoles(): string[] { return [...this._assignedRoles]; }
    get assignedUsers(): string[] { return [...this._assignedUsers]; }
    get status(): TaskStatus { return this._status; }
    get createdAt(): Date { return this._createdAt; }
    get expiresAt(): Date | undefined { return this._expiresAt; }
    get completedAt(): Date | undefined { return this._completedAt; }
    get completedBy(): string | undefined { return this._completedBy; }

    public complete(userId: string): void {
        this._status = 'COMPLETED';
        this._completedAt = new Date();
        this._completedBy = userId;
    }

    public assignTo(userId: string): void {
        this._status = 'ASSIGNED';
        if (!this._assignedUsers.includes(userId)) {
            this._assignedUsers.push(userId);
        }
    }

    public expire(): void {
        this._status = 'EXPIRED';
    }

    public cancel(): void {
        this._status = 'CANCELLED';
    }
}
