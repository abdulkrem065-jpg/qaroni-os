import { ValidationError } from '../../shared/errors/ValidationError';

export class EquityStatementPeriod {
    constructor(
        public readonly startDate: Date,
        public readonly endDate: Date
    ) {
        if (startDate > endDate) {
            throw new ValidationError('Start date cannot be after end date');
        }
        Object.freeze(this);
    }
}
