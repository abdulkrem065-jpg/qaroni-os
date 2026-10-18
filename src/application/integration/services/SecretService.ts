import { ISecretStore } from '../../../domain/integration/ports/ISecretStore';

export class SecretService {
    constructor(private readonly secretStore: ISecretStore) {}

    public async store(key: string, value: string, ttl?: number): Promise<void> {
        return this.secretStore.storeSecret(key, value, ttl);
    }

    public async retrieve(key: string): Promise<string | null> {
        return this.secretStore.getSecret(key);
    }

    public async rotate(key: string, newValue: string): Promise<void> {
        return this.secretStore.rotateSecret(key, newValue);
    }
}
