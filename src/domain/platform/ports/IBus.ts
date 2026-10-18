import { IDomainEvent } from '../../shared/core/IDomainEvent';

export interface ICommand {
    type: string;
    payload: any;
}

export interface IQuery {
    type: string;
    payload: any;
}

export interface ICommandBus {
    dispatch<T = any>(command: ICommand): Promise<T>;
    registerHandler(commandType: string, handler: (command: ICommand) => Promise<any>): void;
}

export interface IQueryBus {
    execute<T = any>(query: IQuery): Promise<T>;
    registerHandler(queryType: string, handler: (query: IQuery) => Promise<any>): void;
}

export interface IPlatformEventBus {
    publish(event: IDomainEvent): Promise<void>;
    subscribe(eventName: string, handler: (event: IDomainEvent) => Promise<void>): void;
}
