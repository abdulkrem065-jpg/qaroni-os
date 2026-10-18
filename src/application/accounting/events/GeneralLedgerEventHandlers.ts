import { IEventHandler } from '../../ports/IEventBus';
import { PostingCompletedEvent } from '../../../domain/accounting/events/PostingEvents';
import { GeneralLedgerUseCases } from '../usecases/GeneralLedgerUseCases';

export class PostingCompletedEventHandler implements IEventHandler<PostingCompletedEvent> {
    public readonly eventName = 'PostingCompletedEvent';

    constructor(private readonly glUseCases: GeneralLedgerUseCases) {}

    public async handle(event: PostingCompletedEvent): Promise<void> {
        await this.glUseCases.recordPostingBatch(event.organizationId, event.postingBatchId);
    }
}
