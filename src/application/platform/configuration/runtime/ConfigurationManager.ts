import { IConfigurationManager, IConfigurationDomain, EnvironmentType, EnvironmentProfile, IRuntimeConfigurationLoader } from '../../../../domain/platform/ports/IConfigurationEngine';

export class ConfigurationManager implements IConfigurationManager {
    private currentConfig!: IConfigurationDomain;

    constructor(
        private readonly loader: IRuntimeConfigurationLoader,
        private readonly env: EnvironmentType,
        private readonly profile: EnvironmentProfile
    ) {}

    public async initialize(): Promise<void> {
        this.currentConfig = await this.loader.loadConfiguration(this.env, this.profile);
    }

    public getConfig(): IConfigurationDomain {
        if (!this.currentConfig) {
            throw new Error('ConfigurationManager not initialized');
        }
        return this.currentConfig;
    }

    public getEnvironment(): EnvironmentType {
        return this.env;
    }

    public getProfile(): EnvironmentProfile {
        return this.profile;
    }

    public async reload(): Promise<void> {
        this.currentConfig = await this.loader.loadConfiguration(this.env, this.profile);
    }
}
