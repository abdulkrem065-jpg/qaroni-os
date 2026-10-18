import { FiscalYear } from '../aggregates/FiscalYear';
import { AccountingPeriodId } from '../valueobjects/AccountingPeriodId';
import { PeriodStatus } from '../valueobjects/PeriodStatus';
import { BusinessRuleError } from '../../shared/errors/BusinessRuleError';

export class ReopeningAuthorizationEngine {
    /**
     * Authorizes and executes the reopening of a period.
     */
    public static authorizeAndReopenPeriod(
        fiscalYear: FiscalYear, 
        periodId: AccountingPeriodId, 
        authorizationReason: string
    ): void {
        if (!authorizationReason || authorizationReason.trim().length < 10) {
            throw new BusinessRuleError('Reopening a period requires a comprehensive authorization reason for audit');
        }

        const period = fiscalYear.periods.find(p => p.id.equals(periodId));
        if (!period) throw new BusinessRuleError('Period not found');

        if (!period.status.isLocked() && !period.status.isClosing()) {
            throw new BusinessRuleError('Only LOCKED or CLOSING periods can be reopened');
        }

        if (fiscalYear.status.value === 'CLOSED') {
            throw new BusinessRuleError('Cannot reopen a period in a CLOSED fiscal year. Fiscal year must be reopened first.');
        }

        fiscalYear.changePeriodStatus(periodId, new PeriodStatus('OPENING'));
    }
}
