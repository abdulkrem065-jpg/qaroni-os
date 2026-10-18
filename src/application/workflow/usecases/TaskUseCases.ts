import { IWorkflowInstanceRepository } from '../../../domain/workflow/repositories/IWorkflowInstanceRepository';
import { IEventBus } from '../../ports/IEventBus';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { WorkflowInstanceId } from '../../../domain/workflow/valueobjects/WorkflowInstanceId';
import { TaskId } from '../../../domain/workflow/valueobjects/TaskId';
import { BusinessRuleError } from '../../../domain/shared/errors/BusinessRuleError';

export class TaskUseCases {
    constructor(
        private readonly instanceRepo: IWorkflowInstanceRepository,
        private readonly eventBus: IEventBus
    ) {}

    public async assignTask(organizationId: string, instanceId: string, taskId: string, userId: string): Promise<void> {
        const orgId = new OrganizationId(organizationId);
        const instance = await this.instanceRepo.findById(new WorkflowInstanceId(instanceId), orgId);
        if (!instance) throw new BusinessRuleError('Workflow instance not found');

        const task = instance.tasks.find(t => t.id.equals(new TaskId(taskId)));
        if (!task) throw new BusinessRuleError('Task not found');
        
        task.assignTo(userId);

        await this.instanceRepo.save(instance);
        for (const event of instance.domainEvents) {
            await this.eventBus.publish(event);
        }
        instance.clearDomainEvents();
    }

    public async completeTask(organizationId: string, instanceId: string, taskId: string, actorId: string): Promise<void> {
        const orgId = new OrganizationId(organizationId);
        const instance = await this.instanceRepo.findById(new WorkflowInstanceId(instanceId), orgId);
        if (!instance) throw new BusinessRuleError('Workflow instance not found');

        instance.completeTask(new TaskId(taskId), actorId);

        await this.instanceRepo.save(instance);
        
        for (const event of instance.domainEvents) {
            await this.eventBus.publish(event);
        }
        instance.clearDomainEvents();
    }
}
