export interface ISecretStore {
    storeSecret(key: string, value: string, ttl?: number): Promise<void>;
    getSecret(key: string): Promise<string | null>;
    deleteSecret(key: string): Promise<void>;
    rotateSecret(key: string, newValue: string): Promise<void>;
}
