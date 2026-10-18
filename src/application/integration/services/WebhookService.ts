import { IWebhookRegistry, IWebhookDispatcher, IWebhookConfig } from '../../../domain/integration/ports/IWebhookRegistry';

export class WebhookService {
    constructor(
        private readonly registry: IWebhookRegistry,
        private readonly dispatcher: IWebhookDispatcher
    ) {}

    public async registerWebhook(config: IWebhookConfig): Promise<void> {
        await this.registry.register(config);
    }

    public async removeWebhook(webhookId: string): Promise<void> {
        await this.registry.unregister(webhookId);
    }

    public async triggerEvent(eventType: string, payload: any): Promise<void> {
        await this.dispatcher.dispatch(eventType, payload);
    }
}
