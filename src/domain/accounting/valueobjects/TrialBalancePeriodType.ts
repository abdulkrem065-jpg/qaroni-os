import { ValidationError } from '../../shared/errors/ValidationError';
export type PeriodType = 'DAILY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM';
export class TrialBalancePeriodType {
    public readonly value: PeriodType;
    constructor(value: string) {
        if (!['DAILY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM'].includes(value)) {
            throw new ValidationError('Invalid TrialBalancePeriodType');
        }
        this.value = value as PeriodType;
        Object.freeze(this);
    }
}
