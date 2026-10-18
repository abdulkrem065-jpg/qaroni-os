import { ICommandBus, IQueryBus, IPlatformEventBus, ICommand, IQuery } from '../../../domain/platform/ports/IBus';
import { IDomainEvent } from '../../../domain/shared/core/IDomainEvent';

export class RuntimeService {
    constructor(
        private readonly commandBus: ICommandBus,
        private readonly queryBus: IQueryBus,
        private readonly eventBus: IPlatformEventBus
    ) {}

    public async executeCommand<T = any>(command: ICommand): Promise<T> {
        return this.commandBus.dispatch<T>(command);
    }

    public async executeQuery<T = any>(query: IQuery): Promise<T> {
        return this.queryBus.execute<T>(query);
    }

    public async publishEvent(event: IDomainEvent): Promise<void> {
        return this.eventBus.publish(event);
    }
}
