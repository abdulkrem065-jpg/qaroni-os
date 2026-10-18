import { IHttpConnector, IConnectorConfig } from '../../../domain/integration/ports/IConnector';
import { IIntegrationPayload } from '../../../domain/integration/models/IntegrationConfig';

export abstract class AbstractHttpConnector implements IHttpConnector {
    public abstract execute(operation: string, payload: IIntegrationPayload, config: IConnectorConfig): Promise<any>;
    public abstract healthCheck(config: IConnectorConfig): Promise<boolean>;
    
    public abstract get(path: string, config: IConnectorConfig, queryParams?: Record<string, any>): Promise<any>;
    public abstract post(path: string, payload: IIntegrationPayload, config: IConnectorConfig): Promise<any>;
    public abstract put(path: string, payload: IIntegrationPayload, config: IConnectorConfig): Promise<any>;
    public abstract delete(path: string, config: IConnectorConfig): Promise<any>;
}
