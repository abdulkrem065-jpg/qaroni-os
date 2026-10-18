import { IWebhookRegistry, IWebhookDispatcher, IWebhookConfig } from '../../../domain/integration/ports/IWebhookRegistry';

export abstract class AbstractWebhookRegistry implements IWebhookRegistry {
    protected webhooks: Map<string, IWebhookConfig> = new Map();

    public async register(config: IWebhookConfig): Promise<void> {
        this.webhooks.set(config.id, config);
    }

    public async unregister(webhookId: string): Promise<void> {
        this.webhooks.delete(webhookId);
    }

    public async getWebhooksByEvent(eventType: string): Promise<IWebhookConfig[]> {
        return Array.from(this.webhooks.values()).filter(wh => wh.eventTypes.includes(eventType) && wh.isActive);
    }

    public async updateStatus(webhookId: string, isActive: boolean): Promise<void> {
        const webhook = this.webhooks.get(webhookId);
        if (webhook) {
            webhook.isActive = isActive;
            this.webhooks.set(webhookId, webhook);
        }
    }
}

export abstract class AbstractWebhookDispatcher implements IWebhookDispatcher {
    constructor(protected readonly registry: IWebhookRegistry) {}

    public abstract dispatch(eventType: string, payload: any): Promise<void>;
}
