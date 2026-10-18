import { ISecretValidator } from '../../../../domain/platform/ports/IConfigurationEngine';

export class SecretValidator implements ISecretValidator {
    public validate(key: string, value: string): boolean {
        if (!value || value.trim() === '') {
            return false;
        }
        // Minimal basic validation - specific keys could have more complex rules
        if (key.includes('PASSWORD') && value.length < 8) {
            return false;
        }
        return true;
    }
}
