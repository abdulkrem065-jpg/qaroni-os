import { ISchedulerExecutor, IScheduledJob } from '../../../domain/platform/ports/ISchedulerEngine';
import { QueueDispatcher } from '../queue/QueueDispatcher';
import { IQueueMessageContext } from '../../../domain/platform/ports/IQueueEngine';
import * as crypto from 'crypto';

export class SchedulerExecutor implements ISchedulerExecutor {
    constructor(private readonly queueDispatcher: QueueDispatcher) {}

    public async execute(job: IScheduledJob): Promise<void> {
        let queueContext: IQueueMessageContext;
        
        if ('isGlobal' in job.context && job.context.isGlobal) {
            queueContext = {
                organizationId: 'system',
                correlationId: crypto.randomUUID()
            };
        } else {
            const tenantContext = job.context as { organizationId: string; branchId?: string };
            queueContext = {
                organizationId: tenantContext.organizationId,
                branchId: tenantContext.branchId,
                correlationId: crypto.randomUUID()
            };
        }

        // Dispatch the job to the queue engine
        await this.queueDispatcher.dispatch(job.queueName, job.payload, queueContext);
    }
}
