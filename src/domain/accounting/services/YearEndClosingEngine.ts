import { FiscalYear } from '../aggregates/FiscalYear';
import { TrialBalance } from '../aggregates/TrialBalance';
import { ClosingVerificationEngine } from './ClosingVerificationEngine';
import { BusinessRuleError } from '../../shared/errors/BusinessRuleError';

export class YearEndClosingEngine {
    /**
     * Closes the fiscal year after deep verification.
     */
    public static closeYear(fiscalYear: FiscalYear, finalTrialBalance: TrialBalance): void {
        if (fiscalYear.status.value === 'CLOSED') {
            throw new BusinessRuleError('Fiscal year is already closed');
        }

        // Deep verification
        ClosingVerificationEngine.verifyReadyForYearEndClose(fiscalYear, finalTrialBalance);

        // Transition status
        fiscalYear.close();
    }
}
