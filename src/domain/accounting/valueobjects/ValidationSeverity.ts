import { ValidationError } from '../../shared/errors/ValidationError';
export type SeverityType = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
export class ValidationSeverity {
    public readonly value: SeverityType;
    constructor(value: string) {
        if (!['INFO', 'WARNING', 'ERROR', 'CRITICAL'].includes(value)) {
            throw new ValidationError('Invalid ValidationSeverity');
        }
        this.value = value as SeverityType;
        Object.freeze(this);
    }
}
