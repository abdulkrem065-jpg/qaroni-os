import { IAccountClassificationService, AccountClassification } from '../../../domain/accounting/services/IAccountClassificationService';

export class DefaultAccountClassificationService implements IAccountClassificationService {
    public classify(accountNumber: string): AccountClassification {
        const prefix = parseInt(accountNumber.substring(0, 1) || '0', 10);
        const code = parseInt(accountNumber, 10);

        if (prefix === 1) {
            // ASSETS
            if (code >= 1000 && code < 1500) return { mainSection: 'ASSETS', subSection: 'CURRENT_ASSETS', normalBalance: 'DEBIT' };
            return { mainSection: 'ASSETS', subSection: 'NON_CURRENT_ASSETS', normalBalance: 'DEBIT' };
        } 
        
        if (prefix === 2) {
            // LIABILITIES
            if (code >= 2000 && code < 2500) return { mainSection: 'LIABILITIES', subSection: 'CURRENT_LIABILITIES', normalBalance: 'CREDIT' };
            return { mainSection: 'LIABILITIES', subSection: 'LONG_TERM_LIABILITIES', normalBalance: 'CREDIT' };
        }
        
        if (prefix === 3) {
            // EQUITY
            if (code === 3100) return { mainSection: 'EQUITY', subSection: 'RETAINED_EARNINGS', normalBalance: 'CREDIT' };
            if (code === 3200) return { mainSection: 'EQUITY', subSection: 'CURRENT_PROFIT', normalBalance: 'CREDIT' };
            if (code >= 3300 && code <= 3500) return { mainSection: 'EQUITY', subSection: 'RESERVES', normalBalance: 'CREDIT' };
            return { mainSection: 'EQUITY', subSection: 'CAPITAL', normalBalance: 'CREDIT' };
        }

        // Default fallback (e.g. Income/Expenses usually are 4/5, but they close into Equity -> Current Profit)
        // Since Balance Sheet only deals with Assets, Liabilities, Equity (after closing), 
        // anything else would be an error in a real system unless it's an unclosed P&L account.
        // For simplicity, map unknown to Equity Reserves
        return { mainSection: 'EQUITY', subSection: 'RESERVES', normalBalance: 'CREDIT' };
    }
}
