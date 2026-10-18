import { FiscalYear } from '../aggregates/FiscalYear';
import { AccountingPeriodId } from '../valueobjects/AccountingPeriodId';
import { PeriodStatus } from '../valueobjects/PeriodStatus';
import { BusinessRuleError } from '../../shared/errors/BusinessRuleError';

export class PeriodLockManager {
    /**
     * Attempts to lock an accounting period.
     */
    public static lockPeriod(fiscalYear: FiscalYear, periodId: AccountingPeriodId): void {
        const period = fiscalYear.periods.find(p => p.id.equals(periodId));
        if (!period) throw new BusinessRuleError('Period not found');

        // Can only lock an OPENING or CLOSING period
        if (period.status.isLocked() || period.status.isArchived()) {
            throw new BusinessRuleError('Period is already locked or archived');
        }

        fiscalYear.changePeriodStatus(periodId, new PeriodStatus('LOCKED'));
    }

    public static initiateClosing(fiscalYear: FiscalYear, periodId: AccountingPeriodId): void {
        const period = fiscalYear.periods.find(p => p.id.equals(periodId));
        if (!period) throw new BusinessRuleError('Period not found');

        if (!period.status.isOpening()) {
            throw new BusinessRuleError('Can only initiate closing from OPENING status');
        }

        fiscalYear.changePeriodStatus(periodId, new PeriodStatus('CLOSING'));
    }
}
