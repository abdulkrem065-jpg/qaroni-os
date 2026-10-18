import { IConfigurationValidator, IConfigurationDomain } from '../../../../domain/platform/ports/IConfigurationEngine';

export class ConfigurationValidator implements IConfigurationValidator {
    public validate(config: Partial<IConfigurationDomain>): void {
        const missing: string[] = [];
        
        if (!config.database) missing.push('database');
        if (!config.redis) missing.push('redis');
        if (!config.security) missing.push('security');
        
        if (missing.length > 0) {
            throw new Error(`Critical configuration missing: ${missing.join(', ')}`);
        }
    }
}
