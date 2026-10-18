import { describe, it, expect, vi } from 'vitest';
import { SecretManager } from '../../../src/application/platform/configuration/secret/SecretManager';
import { SecretResolver } from '../../../src/application/platform/configuration/secret/SecretResolver';
import { SecretValidator } from '../../../src/application/platform/configuration/secret/SecretValidator';
import { LocalSecretProvider } from '../../../src/infrastructure/platform/configuration/secret/providers/LocalSecretProvider';
import { ConfigurationManager } from '../../../src/application/platform/configuration/runtime/ConfigurationManager';
import { ConfigurationValidator } from '../../../src/application/platform/configuration/runtime/ConfigurationValidator';
import { RuntimeConfigurationLoader } from '../../../src/application/platform/configuration/runtime/RuntimeConfigurationLoader';
import { ConfigurationProvider } from '../../../src/application/platform/configuration/runtime/ConfigurationProvider';
import { EnvironmentType, EnvironmentProfile } from '../../../src/domain/platform/ports/IConfigurationEngine';

// Mock AuditStream
class MockAuditStream {
    public records: any[] = [];
    public async append(record: any): Promise<void> {
        this.records.push(record);
    }
}

describe('Enterprise Configuration Platform', () => {
    describe('Secret Management', () => {
        it('should store and resolve secrets via local provider', async () => {
            const provider = new LocalSecretProvider();
            const resolver = new SecretResolver(provider);
            const validator = new SecretValidator();
            const audit = new MockAuditStream();
            const manager = new SecretManager(provider, resolver, validator, audit as any);

            await manager.set('TEST_KEY', 'test_value123');
            
            const value = await manager.get('TEST_KEY');
            expect(value).toBe('test_value123');

            expect(audit.records.length).toBe(2);
            expect(audit.records[0].action).toBe('SECRET_CHANGE');
            expect(audit.records[1].action).toBe('SECRET_ACCESS');
        });

        it('should validate secrets based on rules', async () => {
            const provider = new LocalSecretProvider();
            const resolver = new SecretResolver(provider);
            const validator = new SecretValidator();
            const audit = new MockAuditStream();
            const manager = new SecretManager(provider, resolver, validator, audit as any);

            await expect(manager.set('DB_PASSWORD', 'short')).rejects.toThrow('Invalid secret format for key: DB_PASSWORD');
            await expect(manager.set('DB_PASSWORD', 'longerpassword123')).resolves.toBeUndefined();
        });
    });

    describe('Runtime Configuration', () => {
        it('should load environment configuration successfully', async () => {
            const provider = new LocalSecretProvider();
            const resolver = new SecretResolver(provider);
            const configProvider = new ConfigurationProvider(resolver);
            const validator = new ConfigurationValidator();
            const audit = new MockAuditStream();
            const loader = new RuntimeConfigurationLoader(configProvider, validator, audit as any);
            const manager = new ConfigurationManager(loader, EnvironmentType.DEVELOPMENT, EnvironmentProfile.LOCAL);

            await manager.initialize();
            
            const config = manager.getConfig();
            expect(config).toBeDefined();
            expect(config.database).toBeDefined();
            expect(config.redis).toBeDefined();
            expect(manager.getEnvironment()).toBe(EnvironmentType.DEVELOPMENT);
            expect(manager.getProfile()).toBe(EnvironmentProfile.LOCAL);
        });

        it('should fail validation if configuration is missing critical components', () => {
            const validator = new ConfigurationValidator();
            expect(() => validator.validate({})).toThrow('Critical configuration missing');
            expect(() => validator.validate({ database: {} } as any)).toThrow('Critical configuration missing');
        });
    });
});
