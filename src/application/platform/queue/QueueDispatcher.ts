import { IQueueDispatcher, IQueueMessageContext, IQueueMessageOptions } from '../../../domain/platform/ports/IQueueEngine';

export class QueueDispatcher {
    constructor(private readonly dispatcherPort: IQueueDispatcher) {}

    public async dispatch(queueName: string, payload: any, context: IQueueMessageContext, options?: IQueueMessageOptions): Promise<string> {
        return this.dispatcherPort.dispatch(queueName, payload, context, options);
    }
}
