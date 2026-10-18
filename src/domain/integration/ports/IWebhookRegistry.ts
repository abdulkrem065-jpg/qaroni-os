export interface IWebhookConfig {
    id: string;
    url: string;
    secretKey?: string;
    eventTypes: string[];
    isActive: boolean;
    retryCount: number;
}

export interface IWebhookRegistry {
    register(config: IWebhookConfig): Promise<void>;
    unregister(webhookId: string): Promise<void>;
    getWebhooksByEvent(eventType: string): Promise<IWebhookConfig[]>;
    updateStatus(webhookId: string, isActive: boolean): Promise<void>;
}

export interface IWebhookDispatcher {
    dispatch(eventType: string, payload: any): Promise<void>;
}
