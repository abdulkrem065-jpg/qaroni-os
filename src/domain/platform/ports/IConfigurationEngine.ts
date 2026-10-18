export enum EnvironmentType {
    DEVELOPMENT = 'DEVELOPMENT',
    TESTING = 'TESTING',
    STAGING = 'STAGING',
    PRODUCTION = 'PRODUCTION'
}

export enum EnvironmentProfile {
    LOCAL = 'LOCAL',
    DOCKER = 'DOCKER',
    KUBERNETES = 'KUBERNETES',
    GOOGLE_CLOUD = 'GOOGLE_CLOUD',
    RENDER = 'RENDER',
    VERCEL = 'VERCEL'
}

export interface ISecretVersion {
    versionId: string;
    value: string;
    createdAt: Date;
    expiresAt?: Date;
    isActive: boolean;
}

export interface ISecretMetadata {
    key: string;
    description?: string;
    isCritical: boolean;
    lastRotatedAt?: Date;
    rotationPolicy?: {
        intervalDays: number;
        autoRotate: boolean;
    };
}

export interface ISecretProvider {
    getSecret(key: string): Promise<string | undefined>;
    getSecretVersion(key: string, versionId: string): Promise<string | undefined>;
    listVersions(key: string): Promise<ISecretVersion[]>;
    putSecret(key: string, value: string, metadata?: ISecretMetadata): Promise<void>;
}

export interface ISecretResolver {
    resolve(key: string): Promise<string>;
}

export interface ISecretValidator {
    validate(key: string, value: string): boolean;
}

export interface ISecretManager {
    get(key: string): Promise<string>;
    set(key: string, value: string, isCritical?: boolean): Promise<void>;
    rotate(key: string, newValue: string): Promise<void>;
    checkExpirations(): Promise<void>;
}

export interface IConfigurationDomain {
    database: Record<string, any>;
    redis: Record<string, any>;
    queue: Record<string, any>;
    scheduler: Record<string, any>;
    security: Record<string, any>;
    jwt: Record<string, any>;
    oauth: Record<string, any>;
    smtp: Record<string, any>;
    aiProviders: Record<string, any>;
    storage: Record<string, any>;
    monitoring: Record<string, any>;
}

export interface IConfigurationProvider {
    load(env: EnvironmentType, profile: EnvironmentProfile): Promise<Partial<IConfigurationDomain>>;
}

export interface IConfigurationValidator {
    validate(config: Partial<IConfigurationDomain>): void;
}

export interface IRuntimeConfigurationLoader {
    loadConfiguration(env: EnvironmentType, profile: EnvironmentProfile): Promise<IConfigurationDomain>;
}

export interface IConfigurationManager {
    getConfig(): IConfigurationDomain;
    getEnvironment(): EnvironmentType;
    getProfile(): EnvironmentProfile;
    reload(): Promise<void>;
}
