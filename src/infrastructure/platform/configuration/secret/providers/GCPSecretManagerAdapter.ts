import { ISecretProvider, ISecretVersion, ISecretMetadata } from '../../../../../domain/platform/ports/IConfigurationEngine';

export class GCPSecretManagerAdapter implements ISecretProvider {
    public async getSecret(key: string): Promise<string | undefined> {
        throw new Error('Method not implemented.');
    }
    public async getSecretVersion(key: string, versionId: string): Promise<string | undefined> {
        throw new Error('Method not implemented.');
    }
    public async listVersions(key: string): Promise<ISecretVersion[]> {
        throw new Error('Method not implemented.');
    }
    public async putSecret(key: string, value: string, metadata?: ISecretMetadata): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
