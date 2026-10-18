import { ICommandBus, IQueryBus, IPlatformEventBus, ICommand, IQuery } from '../../../domain/platform/ports/IBus';
import { IDomainEvent } from '../../../domain/shared/core/IDomainEvent';

export abstract class AbstractCommandBus implements ICommandBus {
    protected handlers: Map<string, (command: ICommand) => Promise<any>> = new Map();

    public registerHandler(commandType: string, handler: (command: ICommand) => Promise<any>): void {
        this.handlers.set(commandType, handler);
    }

    public abstract dispatch<T = any>(command: ICommand): Promise<T>;
}

export abstract class AbstractQueryBus implements IQueryBus {
    protected handlers: Map<string, (query: IQuery) => Promise<any>> = new Map();

    public registerHandler(queryType: string, handler: (query: IQuery) => Promise<any>): void {
        this.handlers.set(queryType, handler);
    }

    public abstract execute<T = any>(query: IQuery): Promise<T>;
}

export abstract class AbstractEventBus implements IPlatformEventBus {
    protected subscribers: Map<string, Array<(event: IDomainEvent) => Promise<void>>> = new Map();

    public subscribe(eventName: string, handler: (event: IDomainEvent) => Promise<void>): void {
        if (!this.subscribers.has(eventName)) {
            this.subscribers.set(eventName, []);
        }
        this.subscribers.get(eventName)!.push(handler);
    }

    public abstract publish(event: IDomainEvent): Promise<void>;
}
