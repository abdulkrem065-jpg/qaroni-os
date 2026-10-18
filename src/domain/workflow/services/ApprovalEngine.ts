import { ApprovalRule } from '../valueobjects/ApprovalRule';
import { WorkflowTask } from '../entities/WorkflowTask';
import { TaskId } from '../valueobjects/TaskId';
import { WorkflowInstanceId } from '../valueobjects/WorkflowInstanceId';
import * as crypto from 'crypto';

export class ApprovalEngine {
    public static createApprovalTasks(
        instanceId: WorkflowInstanceId,
        rule: ApprovalRule,
        entityContext: string
    ): WorkflowTask[] {
        const tasks: WorkflowTask[] = [];

        if (rule.type === 'SINGLE' || rule.type === 'PARALLEL' || rule.type === 'MULTI_LEVEL' || rule.type === 'SEQUENTIAL') {
            for (let i = 0; i < rule.requiredApprovals; i++) {
                const title = `Approval needed for ${entityContext} (Step ${i + 1})`;
                const task = WorkflowTask.create(
                    new TaskId(crypto.randomUUID()),
                    instanceId,
                    title,
                    rule.roles,
                    []
                );
                tasks.push(task);
            }
        }

        return tasks;
    }
}
