export interface ISecretProvider {
    getSecret(key: string): Promise<string | null>;
}

export interface IKeyResolver {
    resolvePublicKey(keyId: string): Promise<string | null>;
    resolvePrivateKey(keyId: string): Promise<string | null>;
}
