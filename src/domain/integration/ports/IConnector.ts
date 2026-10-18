import { IIntegrationPayload } from '../models/IntegrationConfig';

export interface IConnectorConfig {
    endpoint: string;
    authType: 'NONE' | 'BASIC' | 'BEARER' | 'OAUTH2' | 'API_KEY';
    timeoutMs?: number;
    retryPolicy?: {
        maxAttempts: number;
        backoffMultiplier: number;
    };
    headers?: Record<string, string>;
}

export interface IConnector {
    execute(operation: string, payload: IIntegrationPayload, config: IConnectorConfig): Promise<any>;
    healthCheck(config: IConnectorConfig): Promise<boolean>;
}

export interface IHttpConnector extends IConnector {
    get(path: string, config: IConnectorConfig, queryParams?: Record<string, any>): Promise<any>;
    post(path: string, payload: IIntegrationPayload, config: IConnectorConfig): Promise<any>;
    put(path: string, payload: IIntegrationPayload, config: IConnectorConfig): Promise<any>;
    delete(path: string, config: IConnectorConfig): Promise<any>;
}
