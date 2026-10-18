export interface IConfiguration {
    get<T>(key: string, defaultValue?: T): T;
    set<T>(key: string, value: T): Promise<void>;
    getAll(): Record<string, any>;
}

export interface IFeatureFlags {
    isEnabled(flagName: string, context?: Record<string, any>): Promise<boolean>;
    enable(flagName: string): Promise<void>;
    disable(flagName: string): Promise<void>;
}

export interface IEnvironmentProvider {
    getEnv(): string;
    isProduction(): boolean;
    isDevelopment(): boolean;
}
