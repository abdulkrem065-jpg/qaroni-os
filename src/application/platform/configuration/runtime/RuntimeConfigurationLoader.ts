import { IRuntimeConfigurationLoader, IConfigurationDomain, EnvironmentType, EnvironmentProfile, IConfigurationProvider, IConfigurationValidator } from '../../../../domain/platform/ports/IConfigurationEngine';
import { IImmutableAuditStream } from '../../../../domain/platform/ports/IObservability';

export class RuntimeConfigurationLoader implements IRuntimeConfigurationLoader {
    constructor(
        private readonly provider: IConfigurationProvider,
        private readonly validator: IConfigurationValidator,
        private readonly auditStream: IImmutableAuditStream
    ) {}

    public async loadConfiguration(env: EnvironmentType, profile: EnvironmentProfile): Promise<IConfigurationDomain> {
        const config = await this.provider.load(env, profile);
        
        this.validator.validate(config);

        await this.auditStream.append({
            id: Math.random().toString(36).substring(7),
            timestamp: new Date(),
            organizationId: 'SYSTEM',
            userId: 'SYSTEM',
            action: 'CONFIGURATION_LOAD',
            resource: 'ApplicationConfiguration',
            details: { env, profile }
        });

        return config as IConfigurationDomain;
    }
}
