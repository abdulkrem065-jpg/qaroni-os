import { TrialBalance } from '../aggregates/TrialBalance';
import { IAccountClassificationService } from './IAccountClassificationService';
import { BusinessRuleError } from '../../shared/errors/BusinessRuleError';

export interface OpeningBalanceLine {
    accountId: string;
    accountNumber: string;
    debit: number;
    credit: number;
}

export class OpeningBalanceGenerator {
    constructor(private readonly classificationService: IAccountClassificationService) {}

    public generateOpeningBalances(
        closedTrialBalance: TrialBalance,
        retainedEarningsAccountId: string,
        retainedEarningsAccountNumber: string
    ): OpeningBalanceLine[] {
        closedTrialBalance.validateBalance();

        const openingLines: OpeningBalanceLine[] = [];
        let netIncomeForYear = 0; // Net Income = Total Rev (Credit) - Total Exp (Debit)

        for (const account of closedTrialBalance.accounts) {
            const classification = this.classificationService.classify(account.accountNumber);
            
            // Note: If IAccountClassificationService is specifically for Income Statement, we might need a general one.
            // Assuming we can determine permanent vs temporary by account number (e.g. 1,2,3 = Permanent, 4,5,6 = Temporary).
            // Let's implement a robust check.
            const isPermanent = account.accountNumber.startsWith('1') || 
                                account.accountNumber.startsWith('2') || 
                                account.accountNumber.startsWith('3');
            
            const isTemporary = account.accountNumber.startsWith('4') || 
                                account.accountNumber.startsWith('5') || 
                                account.accountNumber.startsWith('6') ||
                                account.accountNumber.startsWith('7') ||
                                account.accountNumber.startsWith('8') ||
                                account.accountNumber.startsWith('9');

            if (isPermanent) {
                // Carry forward exact balance
                if (account.balance.debit.value > 0 || account.balance.credit.value > 0) {
                    openingLines.push({
                        accountId: account.accountId.value,
                        accountNumber: account.accountNumber,
                        debit: account.balance.debit.value,
                        credit: account.balance.credit.value
                    });
                }
            } else if (isTemporary) {
                // Net against Retained Earnings
                const amount = account.balance.credit.value - account.balance.debit.value;
                netIncomeForYear += amount;
            }
        }

        // Apply Net Income to Retained Earnings
        if (netIncomeForYear !== 0) {
            let reDebit = 0;
            let reCredit = 0;
            if (netIncomeForYear > 0) {
                reCredit = netIncomeForYear; // Net Profit increases Equity (Credit)
            } else {
                reDebit = Math.abs(netIncomeForYear); // Net Loss decreases Equity (Debit)
            }

            // We need to merge with existing RE line if it exists
            const existingRE = openingLines.find(l => l.accountId === retainedEarningsAccountId);
            if (existingRE) {
                existingRE.debit += reDebit;
                existingRE.credit += reCredit;
                
                // Simplify debit/credit
                if (existingRE.debit > existingRE.credit) {
                    existingRE.debit -= existingRE.credit;
                    existingRE.credit = 0;
                } else {
                    existingRE.credit -= existingRE.debit;
                    existingRE.debit = 0;
                }
            } else {
                openingLines.push({
                    accountId: retainedEarningsAccountId,
                    accountNumber: retainedEarningsAccountNumber,
                    debit: reDebit,
                    credit: reCredit
                });
            }
        }

        // Validate that opening lines are balanced
        const totalDebit = openingLines.reduce((sum, line) => sum + line.debit, 0);
        const totalCredit = openingLines.reduce((sum, line) => sum + line.credit, 0);
        
        if (Math.abs(totalDebit - totalCredit) > 0.001) {
            throw new BusinessRuleError(`Generated Opening Balances do not match: Debit (${totalDebit}) != Credit (${totalCredit})`);
        }

        return openingLines;
    }
}
