
export interface IEventHandler<T = any> {
    eventName: string;
    handle(event: T): Promise<void>;
}

import { DomainEvent } from '../../domain/iam/events/IamDomainEvents';

export interface IEventBus {
    publish(event: any): Promise<void>;
    publishAll(events: ReadonlyArray<any>): Promise<void>;
    subscribe?(handler: IEventHandler): void;
}
