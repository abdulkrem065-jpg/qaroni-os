import { ISecretStore } from '../../../domain/integration/ports/ISecretStore';

export abstract class AbstractSecretStore implements ISecretStore {
    public abstract storeSecret(key: string, value: string, ttl?: number): Promise<void>;
    public abstract getSecret(key: string): Promise<string | null>;
    public abstract deleteSecret(key: string): Promise<void>;
    
    public async rotateSecret(key: string, newValue: string): Promise<void> {
        await this.storeSecret(key, newValue);
    }
}
