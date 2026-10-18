import { IConfiguration, IFeatureFlags, IEnvironmentProvider } from '../../../domain/platform/ports/IConfig';

export abstract class AbstractConfiguration implements IConfiguration {
    public abstract get<T>(key: string, defaultValue?: T): T;
    public abstract set<T>(key: string, value: T): Promise<void>;
    public abstract getAll(): Record<string, any>;
}

export abstract class AbstractFeatureFlags implements IFeatureFlags {
    public abstract isEnabled(flagName: string, context?: Record<string, any>): Promise<boolean>;
    public abstract enable(flagName: string): Promise<void>;
    public abstract disable(flagName: string): Promise<void>;
}

export abstract class AbstractEnvironmentProvider implements IEnvironmentProvider {
    public abstract getEnv(): string;
    public abstract isProduction(): boolean;
    public abstract isDevelopment(): boolean;
}
