import { WorkflowInstance } from '../aggregates/WorkflowInstance';
import { WorkflowInstanceId } from '../valueobjects/WorkflowInstanceId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export interface IWorkflowInstanceRepository {
    findById(id: WorkflowInstanceId, orgId: OrganizationId): Promise<WorkflowInstance | null>;
    findByEntity(entityId: string, entityType: string, orgId: OrganizationId): Promise<WorkflowInstance | null>;
    save(instance: WorkflowInstance): Promise<void>;
}
