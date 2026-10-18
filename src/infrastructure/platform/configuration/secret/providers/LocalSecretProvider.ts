import { ISecretProvider, ISecretVersion, ISecretMetadata } from '../../../../../domain/platform/ports/IConfigurationEngine';

export class LocalSecretProvider implements ISecretProvider {
    private store = new Map<string, { value: string, metadata?: ISecretMetadata, versions: ISecretVersion[] }>();

    public async getSecret(key: string): Promise<string | undefined> {
        // Fallback to process.env if not explicitly set in the local store
        if (this.store.has(key)) {
            return this.store.get(key)!.value;
        }
        return process.env[key];
    }

    public async getSecretVersion(key: string, versionId: string): Promise<string | undefined> {
        const secret = this.store.get(key);
        if (!secret) return undefined;
        const version = secret.versions.find(v => v.versionId === versionId);
        return version?.value;
    }

    public async listVersions(key: string): Promise<ISecretVersion[]> {
        const secret = this.store.get(key);
        return secret ? secret.versions : [];
    }

    public async putSecret(key: string, value: string, metadata?: ISecretMetadata): Promise<void> {
        const version: ISecretVersion = {
            versionId: Math.random().toString(36).substring(7),
            value,
            createdAt: new Date(),
            isActive: true
        };

        if (this.store.has(key)) {
            const secret = this.store.get(key)!;
            secret.versions.forEach(v => v.isActive = false); // Deactivate old versions
            secret.versions.push(version);
            secret.value = value;
            secret.metadata = metadata || secret.metadata;
        } else {
            this.store.set(key, {
                value,
                metadata,
                versions: [version]
            });
        }
    }
}
