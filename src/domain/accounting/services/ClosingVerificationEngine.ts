import { FiscalYear } from '../aggregates/FiscalYear';
import { TrialBalance } from '../aggregates/TrialBalance';
import { BusinessRuleError } from '../../shared/errors/BusinessRuleError';
import { AccountingIntegrityValidator } from './AccountingIntegrityValidator';

export class ClosingVerificationEngine {
    public static verifyReadyForYearEndClose(fiscalYear: FiscalYear, finalTrialBalance: TrialBalance): void {
        // 1. Validate accounting integrity
        AccountingIntegrityValidator.validateBeforeClosing(finalTrialBalance, fiscalYear);

        // 2. Ensure all periods are at least locked
        const hasOpenPeriods = fiscalYear.periods.some(p => p.status.isOpening() || p.status.isClosing());
        if (hasOpenPeriods) {
            throw new BusinessRuleError('Cannot close year: There are still OPENING or CLOSING periods. All periods must be LOCKED or ARCHIVED.');
        }

        // 3. (Optional) other deep verification rules...
    }
}
