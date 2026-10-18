import { ISecretProvider, IKeyResolver } from '../../../domain/security/ports/ISecretManagement';
import fs from 'fs';

export class LocalSecretProvider implements ISecretProvider {
    public async getSecret(key: string): Promise<string | null> {
        // Map common keys to standard ENV variables
        const envKey = key.toUpperCase().replace(/[^A-Z0-9]/g, '_');
        return process.env[envKey] || process.env[key] || null;
    }
}

export class LocalKeyResolver implements IKeyResolver {
    public async resolvePublicKey(keyId: string): Promise<string | null> {
        const envKey = `${keyId.toUpperCase()}_PUBLIC_KEY`;
        return process.env[envKey] || null;
    }

    public async resolvePrivateKey(keyId: string): Promise<string | null> {
        const envKey = `${keyId.toUpperCase()}_PRIVATE_KEY`;
        return process.env[envKey] || null;
    }
}
