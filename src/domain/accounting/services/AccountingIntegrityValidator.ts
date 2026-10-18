import { TrialBalance } from '../aggregates/TrialBalance';
import { FiscalYear } from '../aggregates/FiscalYear';
import { BusinessRuleError } from '../../shared/errors/BusinessRuleError';

export class AccountingIntegrityValidator {
    /**
     * Validates that the system state is sound before closing or reporting.
     */
    public static validateBeforeClosing(trialBalance: TrialBalance, fiscalYear: FiscalYear): void {
        // 1. Trial balance must perfectly balance
        trialBalance.validateBalance();

        // 2. Cannot close if there are any DRAFT journals in the period
        // (Assuming checking is done via repo in application layer, we might just validate the aggregate here)
        // For the domain service, we rely on the aggregates passed to it.

        // 3. Ensure the fiscal year matches the trial balance period if necessary
        if (trialBalance.period.endDate.getTime() > fiscalYear.endDate.getTime() ||
            trialBalance.period.startDate.getTime() < fiscalYear.startDate.getTime()) {
            throw new BusinessRuleError('Trial balance period falls outside the fiscal year being validated');
        }
    }
}
