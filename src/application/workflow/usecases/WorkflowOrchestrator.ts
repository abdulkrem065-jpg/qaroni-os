import { IWorkflowDefinitionRepository } from '../../../domain/workflow/repositories/IWorkflowDefinitionRepository';
import { IWorkflowInstanceRepository } from '../../../domain/workflow/repositories/IWorkflowInstanceRepository';
import { IEventBus } from '../../ports/IEventBus';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { WorkflowId } from '../../../domain/workflow/valueobjects/WorkflowId';
import { WorkflowInstanceId } from '../../../domain/workflow/valueobjects/WorkflowInstanceId';
import { WorkflowInstance } from '../../../domain/workflow/aggregates/WorkflowInstance';
import { BusinessRuleError } from '../../../domain/shared/errors/BusinessRuleError';
import { WorkflowEngine } from '../../../domain/workflow/services/WorkflowEngine';
import { ApprovalEngine } from '../../../domain/workflow/services/ApprovalEngine';
import * as crypto from 'crypto';
import { INotificationService } from '../ports/INotificationService';

export class WorkflowOrchestrator {
    constructor(
        private readonly definitionRepo: IWorkflowDefinitionRepository,
        private readonly instanceRepo: IWorkflowInstanceRepository,
        private readonly eventBus: IEventBus,
        private readonly notificationService?: INotificationService
    ) {}

    public async startWorkflow(
        organizationId: string, 
        workflowName: string, 
        entityId: string, 
        entityType: string,
        context: Record<string, any> = {}
    ): Promise<string> {
        const orgId = new OrganizationId(organizationId);
        const definition = await this.definitionRepo.findByName(workflowName);
        
        if (!definition) {
            throw new BusinessRuleError(`Workflow definition '${workflowName}' not found`);
        }

        const existing = await this.instanceRepo.findByEntity(entityId, entityType, orgId);
        if (existing) {
            throw new BusinessRuleError(`Workflow already exists for ${entityType} ${entityId}`);
        }

        const instanceId = new WorkflowInstanceId(crypto.randomUUID());
        const instance = WorkflowInstance.create(
            instanceId,
            orgId,
            definition.id,
            entityId,
            entityType,
            definition.initialState,
            context
        );

        await this.instanceRepo.save(instance);
        await this.publishEvents(instance);

        return instanceId.value;
    }

    public async executeTransition(
        organizationId: string,
        instanceId: string,
        action: string,
        actorId: string,
        reason?: string
    ): Promise<void> {
        const orgId = new OrganizationId(organizationId);
        const instance = await this.instanceRepo.findById(new WorkflowInstanceId(instanceId), orgId);
        if (!instance) throw new BusinessRuleError('Workflow instance not found');

        const definition = await this.definitionRepo.findById(instance.workflowId);
        if (!definition) throw new BusinessRuleError('Workflow definition not found');

        WorkflowEngine.validateTransition(definition, instance, action);

        if (!WorkflowEngine.canTransition(definition, instance, action)) {
            throw new BusinessRuleError(`Cannot execute transition '${action}' due to pending tasks`);
        }

        const transition = definition.getTransition(instance.currentState, action)!;
        
        const isFinal = definition.getTransitionsFrom(transition.toState).length === 0;

        instance.transition(transition.toState, action, actorId, reason, isFinal);

        await this.instanceRepo.save(instance);
        await this.publishEvents(instance);
    }
    
    public async requestApproval(
        organizationId: string,
        instanceId: string,
        action: string,
        actorId: string
    ): Promise<void> {
        const orgId = new OrganizationId(organizationId);
        const instance = await this.instanceRepo.findById(new WorkflowInstanceId(instanceId), orgId);
        if (!instance) throw new BusinessRuleError('Workflow instance not found');

        const definition = await this.definitionRepo.findById(instance.workflowId);
        if (!definition) throw new BusinessRuleError('Workflow definition not found');

        const transition = definition.getTransition(instance.currentState, action);
        if (!transition) throw new BusinessRuleError(`Invalid transition '${action}'`);
        
        if (!transition.approvalRule) {
            throw new BusinessRuleError('This transition does not require approval');
        }
        
        if (instance.getPendingTasks().length > 0) {
            throw new BusinessRuleError('Approval already requested');
        }

        const tasks = ApprovalEngine.createApprovalTasks(instance.id, transition.approvalRule, `${instance.entityType} ${instance.entityId}`);
        for (const task of tasks) {
            instance.addTask(task);
        }

        await this.instanceRepo.save(instance);
        await this.publishEvents(instance);
    }

    public async rejectWorkflow(
        organizationId: string,
        instanceId: string,
        actorId: string,
        reason: string
    ): Promise<void> {
        const orgId = new OrganizationId(organizationId);
        const instance = await this.instanceRepo.findById(new WorkflowInstanceId(instanceId), orgId);
        if (!instance) throw new BusinessRuleError('Workflow instance not found');

        instance.reject(actorId, reason);

        await this.instanceRepo.save(instance);
        await this.publishEvents(instance);
    }

    private async publishEvents(instance: WorkflowInstance): Promise<void> {
        for (const event of instance.domainEvents) {
            await this.eventBus.publish(event);
        }
        instance.clearDomainEvents();
    }
}
