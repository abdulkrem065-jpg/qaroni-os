import { IEventBus, IEventHandler } from '../../application/ports/IEventBus';
import { EventEmitter } from 'events';

export class LocalEventBus implements IEventBus {
    private emitter = new EventEmitter();

    public async publish(event: any): Promise<void> {
        const eventName = event.constructor.name || event.type || 'UnknownEvent';
        this.emitter.emit(eventName, event);
    }

    public async publishAll(events: ReadonlyArray<any>): Promise<void> {
        for (const event of events) {
            await this.publish(event);
        }
    }

    public subscribe(handler: IEventHandler): void {
        this.emitter.on(handler.eventName, async (event: any) => {
            try {
                await handler.handle(event);
            } catch (err) {
                console.error(`Error handling event ${handler.eventName}:`, err);
            }
        });
    }
}
