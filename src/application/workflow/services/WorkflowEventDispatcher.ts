import { IDomainEvent } from '../../../domain/shared/core/IDomainEvent';
import { QueueDispatcher } from '../../platform/queue/QueueDispatcher';

export class WorkflowEventDispatcher {
    constructor(private readonly queueDispatcher: QueueDispatcher) {}

    public async dispatchWorkflowEvent(event: IDomainEvent): Promise<void> {
        // Enqueue the event for async processing instead of direct synchronous publish
        const context = {
            organizationId: 'system', // Ideally extracted from event
            correlationId: Math.random().toString(36).substring(7)
        };
        await this.queueDispatcher.dispatch('workflow-events', event, context);
    }
}
