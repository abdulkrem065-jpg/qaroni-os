import { ISecretManager, ISecretProvider, ISecretResolver, ISecretValidator } from '../../../../domain/platform/ports/IConfigurationEngine';
import { IImmutableAuditStream } from '../../../../domain/platform/ports/IObservability';

export class SecretManager implements ISecretManager {
    constructor(
        private readonly provider: ISecretProvider,
        private readonly resolver: ISecretResolver,
        private readonly validator: ISecretValidator,
        private readonly auditStream: IImmutableAuditStream
    ) {}

    public async get(key: string): Promise<string> {
        const value = await this.resolver.resolve(key);
        
        await this.auditStream.append({
            id: Math.random().toString(36).substring(7),
            timestamp: new Date(),
            organizationId: 'SYSTEM',
            userId: 'SYSTEM',
            action: 'SECRET_ACCESS',
            resource: key,
            details: {}
        });

        return value;
    }

    public async set(key: string, value: string, isCritical: boolean = false): Promise<void> {
        if (!this.validator.validate(key, value)) {
            throw new Error(`Invalid secret format for key: ${key}`);
        }

        await this.provider.putSecret(key, value, {
            key,
            isCritical,
            lastRotatedAt: new Date()
        });

        await this.auditStream.append({
            id: Math.random().toString(36).substring(7),
            timestamp: new Date(),
            organizationId: 'SYSTEM',
            userId: 'SYSTEM',
            action: 'SECRET_CHANGE',
            resource: key,
            details: { isCritical }
        });
    }

    public async rotate(key: string, newValue: string): Promise<void> {
        await this.set(key, newValue, true);
    }

    public async checkExpirations(): Promise<void> {
        // Example check routine, would typically scan metadata index 
        // Not deeply implemented for this example as we rely on abstract providers
    }
}
