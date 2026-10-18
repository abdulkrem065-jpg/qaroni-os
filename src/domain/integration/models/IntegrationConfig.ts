import { EntityId } from '../../shared/valueobjects/EntityId';

export class IntegrationId extends EntityId {}
export class WebhookId extends EntityId {}

export interface IIntegrationPayload {
    data: any;
    metadata: Record<string, any>;
}
