import { IConnector, IConnectorConfig } from '../../../domain/integration/ports/IConnector';
import { IDataTransformer, ITransformationRule } from '../../../domain/integration/ports/IDataTransformer';
import { IIntegrationPayload } from '../../../domain/integration/models/IntegrationConfig';

export class IntegrationOrchestrator {
    constructor(
        private readonly connector: IConnector,
        private readonly transformer: IDataTransformer
    ) {}

    public async executeFlow(
        operation: string, 
        sourceData: any, 
        rules: ITransformationRule[], 
        config: IConnectorConfig
    ): Promise<any> {
        // 1. Transform Data
        const transformedData = await this.transformer.transform(sourceData, rules);
        
        // 2. Prepare Payload
        const payload: IIntegrationPayload = {
            data: transformedData,
            metadata: {
                timestamp: new Date().toISOString(),
                operation
            }
        };

        // 3. Execute via Connector
        return this.connector.execute(operation, payload, config);
    }
}
