import { WorkflowDefinition } from '../aggregates/WorkflowDefinition';
import { WorkflowInstance } from '../aggregates/WorkflowInstance';
import { BusinessRuleError } from '../../shared/errors/BusinessRuleError';

export class WorkflowEngine {
    public static validateTransition(
        definition: WorkflowDefinition, 
        instance: WorkflowInstance, 
        action: string
    ): void {
        const transition = definition.getTransition(instance.currentState, action);
        if (!transition) {
            throw new BusinessRuleError(`Invalid transition '${action}' from state '${instance.currentState.value}' for workflow '${definition.name}'`);
        }
    }

    public static canTransition(
        definition: WorkflowDefinition, 
        instance: WorkflowInstance, 
        action: string
    ): boolean {
        const transition = definition.getTransition(instance.currentState, action);
        if (!transition) return false;

        if (transition.approvalRule) {
            const pending = instance.getPendingTasks();
            if (pending.length > 0) return false;
        }

        return true;
    }
}
