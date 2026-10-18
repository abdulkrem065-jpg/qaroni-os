import { FiscalYear } from '../aggregates/FiscalYear';
import { Journal } from '../aggregates/Journal';
import { BusinessRuleError } from '../../shared/errors/BusinessRuleError';

export class AccountingCycleEngine {
    /**
     * Ensures that a journal can be posted into the given fiscal year.
     * The journal.accountingDate.value must fall within an OPENING or CLOSING period.
     */
    public static validateJournalForPosting(journal: Journal, fiscalYear: FiscalYear): void {
        const period = fiscalYear.getPeriodForDate(journal.accountingDate.value);
        
        if (!period) {
            throw new BusinessRuleError(`Journal date ${journal.accountingDate.value.toISOString()} does not fall within fiscal year ${fiscalYear.year}`);
        }

        if (period.status.isLocked() || period.status.isArchived()) {
            throw new BusinessRuleError(`Cannot post to period ${period.periodNumber} (${period.name}) as it is currently ${period.status.value}`);
        }

        if (fiscalYear.status.value === 'CLOSED') {
            throw new BusinessRuleError('Cannot post to a closed fiscal year');
        }

        journal.validateReadyForApproval(); // Uses DoubleEntryEngine internally
    }
}
