import { ICorrelationIdProvider, ICorrelationContext } from '../../../../domain/platform/ports/IObservability';
import { AsyncLocalStorage } from 'async_hooks';

export class CorrelationIdProvider implements ICorrelationIdProvider {
    private asyncLocalStorage = new AsyncLocalStorage<ICorrelationContext>();

    public get(): string {
        const ctx = this.asyncLocalStorage.getStore();
        return ctx?.correlationId || 'UNKNOWN';
    }

    public setContext(context: ICorrelationContext): void {
        // Normally used within an async context wrapper (e.g., middleware)
        this.asyncLocalStorage.enterWith(context);
    }

    public getContext(): ICorrelationContext | undefined {
        return this.asyncLocalStorage.getStore();
    }
    
    public runWithContext<T>(context: ICorrelationContext, fn: () => T): T {
        return this.asyncLocalStorage.run(context, fn);
    }
}
