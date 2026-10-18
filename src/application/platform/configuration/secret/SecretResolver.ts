import { ISecretResolver, ISecretProvider } from '../../../../domain/platform/ports/IConfigurationEngine';

export class SecretResolver implements ISecretResolver {
    constructor(private readonly provider: ISecretProvider) {}

    public async resolve(key: string): Promise<string> {
        const value = await this.provider.getSecret(key);
        if (value === undefined) {
            throw new Error(`Secret not found for key: ${key}`);
        }
        return value;
    }
}
