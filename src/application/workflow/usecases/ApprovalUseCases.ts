import { IWorkflowInstanceRepository } from '../../../domain/workflow/repositories/IWorkflowInstanceRepository';
import { IEventBus } from '../../ports/IEventBus';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { WorkflowInstanceId } from '../../../domain/workflow/valueobjects/WorkflowInstanceId';
import { TaskId } from '../../../domain/workflow/valueobjects/TaskId';
import { BusinessRuleError } from '../../../domain/shared/errors/BusinessRuleError';
import { INotificationService } from '../ports/INotificationService';
import { WorkflowOrchestrator } from './WorkflowOrchestrator';

export class ApprovalUseCases {
    constructor(
        private readonly instanceRepo: IWorkflowInstanceRepository,
        private readonly orchestrator: WorkflowOrchestrator,
        private readonly notificationService?: INotificationService
    ) {}

    public async approve(
        organizationId: string, 
        instanceId: string, 
        taskId: string, 
        actorId: string,
        transitionActionOnComplete: string
    ): Promise<void> {
        const orgId = new OrganizationId(organizationId);
        const instance = await this.instanceRepo.findById(new WorkflowInstanceId(instanceId), orgId);
        if (!instance) throw new BusinessRuleError('Workflow instance not found');

        const task = instance.tasks.find(t => t.id.equals(new TaskId(taskId)));
        if (!task) throw new BusinessRuleError('Task not found');
        
        // Complete the specific approval task
        instance.completeTask(new TaskId(taskId), actorId);
        await this.instanceRepo.save(instance);

        // Check if all approval tasks are complete
        const pendingApprovals = instance.getPendingTasks();
        if (pendingApprovals.length === 0) {
            // Automatically execute transition
            await this.orchestrator.executeTransition(organizationId, instanceId, transitionActionOnComplete, actorId, 'Auto-transitioned upon full approval');
        } else {
            // Still waiting for others (Parallel/Multi-Level)
            if (this.notificationService) {
                // Notify next approver if sequential
            }
        }
    }

    public async reject(
        organizationId: string, 
        instanceId: string, 
        actorId: string,
        reason: string
    ): Promise<void> {
        // Just reject the whole workflow instance
        await this.orchestrator.rejectWorkflow(organizationId, instanceId, actorId, reason);
    }
}
