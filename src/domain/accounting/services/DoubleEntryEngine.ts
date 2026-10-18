import { Journal } from '../aggregates/Journal';
import { JournalLine } from '../entities/JournalLine';
import { BusinessRuleError } from '../../shared/errors/BusinessRuleError';

/**
 * DoubleEntryEngine
 * Implements the core accounting constitution rule from CHAPTER 1:
 * "Every transaction must have at least one debit and one credit, and total debits must equal total credits."
 */
export class DoubleEntryEngine {
    
    /**
     * Validates a set of journal lines to ensure they adhere to double-entry accounting principles.
     */
    public static validateBalance(lines: ReadonlyArray<JournalLine>): void {
        if (!lines || lines.length < 2) {
            throw new BusinessRuleError('Double Entry Principle Violation: A transaction must have at least two lines.');
        }

        let totalDebit = 0;
        let totalCredit = 0;
        let hasDebit = false;
        let hasCredit = false;

        for (const line of lines) {
            if (line.debit.value > 0) {
                totalDebit += line.debit.value;
                hasDebit = true;
            }
            if (line.credit.value > 0) {
                totalCredit += line.credit.value;
                hasCredit = true;
            }
            
            if (line.debit.value < 0 || line.credit.value < 0) {
                throw new BusinessRuleError('Double Entry Principle Violation: Amounts cannot be negative.');
            }
        }

        if (!hasDebit || !hasCredit) {
            throw new BusinessRuleError('Double Entry Principle Violation: Transaction must have at least one debit and one credit.');
        }

        // Floating point comparison safely
        if (Math.abs(totalDebit - totalCredit) > 0.001) {
            throw new BusinessRuleError(`Double Entry Principle Violation: Total Debits (${totalDebit}) must equal Total Credits (${totalCredit}).`);
        }
    }

    /**
     * Validates an entire Journal aggregate for double-entry compliance before posting.
     */
    public static validateJournal(journal: Journal): void {
        this.validateBalance(journal.lines);
    }
}
