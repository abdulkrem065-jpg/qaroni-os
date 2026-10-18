import { ValidationError } from '../../shared/errors/ValidationError';
export class IncomeStatementPeriod {
    constructor(
        public readonly startDate: Date,
        public readonly endDate: Date
    ) {
        if (startDate > endDate) {
            throw new ValidationError('StartDate cannot be after EndDate');
        }
        Object.freeze(this);
    }
}
