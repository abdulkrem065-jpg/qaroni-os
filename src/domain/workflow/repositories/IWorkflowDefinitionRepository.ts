import { WorkflowDefinition } from '../aggregates/WorkflowDefinition';
import { WorkflowId } from '../valueobjects/WorkflowId';

export interface IWorkflowDefinitionRepository {
    findById(id: WorkflowId): Promise<WorkflowDefinition | null>;
    findByName(name: string): Promise<WorkflowDefinition | null>;
    save(definition: WorkflowDefinition): Promise<void>;
}
