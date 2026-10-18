import { TrialBalancePeriodType } from './TrialBalancePeriodType';
import { ValidationError } from '../../shared/errors/ValidationError';

export class TrialBalancePeriod {
    constructor(
        public readonly type: TrialBalancePeriodType,
        public readonly startDate: Date,
        public readonly endDate: Date
    ) {
        if (startDate > endDate) {
            throw new ValidationError('StartDate cannot be after EndDate');
        }
        Object.freeze(this);
    }
}
