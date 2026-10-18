import { IIncomeStatementClassificationService, IncomeClassification } from '../../../domain/accounting/services/IIncomeStatementClassificationService';

export class DefaultIncomeStatementClassificationService implements IIncomeStatementClassificationService {
    public classify(accountNumber: string): IncomeClassification | null {
        const prefix = parseInt(accountNumber.substring(0, 1) || '0', 10);
        const code = parseInt(accountNumber, 10);

        // Standard Chart of Accounts (COA) assumption:
        // 4xxx: Revenue
        // 5xxx: Cost of Goods Sold (COGS)
        // 6xxx: Operating Expenses
        // 7xxx: Financial Expenses / Other Expenses
        // 8xxx: Taxes / Extraordinary

        if (prefix === 4) {
            // REVENUE
            if (code === 4100) return { mainSection: 'REVENUE', subSection: 'SALES_REVENUE', normalBalance: 'CREDIT' };
            if (code === 4200) return { mainSection: 'REVENUE', subSection: 'SERVICE_REVENUE', normalBalance: 'CREDIT' };
            if (code >= 4300 && code < 4500) return { mainSection: 'REVENUE', subSection: 'OTHER_OPERATING_REVENUE', normalBalance: 'CREDIT' };
            return { mainSection: 'REVENUE', subSection: 'NON_OPERATING_REVENUE', normalBalance: 'CREDIT' };
        } 
        
        if (prefix === 5) {
            // COGS
            if (code === 5100) return { mainSection: 'COGS', subSection: 'INVENTORY_COST', normalBalance: 'DEBIT' };
            if (code === 5200) return { mainSection: 'COGS', subSection: 'PURCHASE_COST', normalBalance: 'DEBIT' };
            return { mainSection: 'COGS', subSection: 'DIRECT_COST', normalBalance: 'DEBIT' };
        }
        
        if (prefix === 6) {
            // OPERATING EXPENSES & DEPRECIATION
            if (code === 6100) return { mainSection: 'OPERATING_EXPENSES', subSection: 'PAYROLL', normalBalance: 'DEBIT' };
            if (code === 6200) return { mainSection: 'OPERATING_EXPENSES', subSection: 'RENT', normalBalance: 'DEBIT' };
            if (code === 6300) return { mainSection: 'OPERATING_EXPENSES', subSection: 'UTILITIES', normalBalance: 'DEBIT' };
            if (code === 6400) return { mainSection: 'OPERATING_EXPENSES', subSection: 'MARKETING_EXPENSES', normalBalance: 'DEBIT' };
            if (code === 6500) return { mainSection: 'OPERATING_EXPENSES', subSection: 'SELLING_EXPENSES', normalBalance: 'DEBIT' };
            
            // Depreciation is often in 6xxx but we classify it as its own main section as per requirements
            if (code === 6800) return { mainSection: 'DEPRECIATION', subSection: 'FIXED_ASSETS_DEPRECIATION', normalBalance: 'DEBIT' };
            if (code === 6850) return { mainSection: 'DEPRECIATION', subSection: 'INTANGIBLE_ASSETS_DEPRECIATION', normalBalance: 'DEBIT' };

            return { mainSection: 'OPERATING_EXPENSES', subSection: 'ADMINISTRATIVE_EXPENSES', normalBalance: 'DEBIT' };
        }

        if (prefix === 7) {
            // FINANCIAL EXPENSES
            if (code === 7100) return { mainSection: 'FINANCIAL_EXPENSES', subSection: 'INTEREST', normalBalance: 'DEBIT' };
            return { mainSection: 'FINANCIAL_EXPENSES', subSection: 'BANKING_CHARGES', normalBalance: 'DEBIT' };
        }

        if (prefix === 8) {
            // TAXES
            return { mainSection: 'TAXES', subSection: 'TAX_PROVISION', normalBalance: 'DEBIT' };
        }

        // Return null for Balance Sheet accounts (1xxx, 2xxx, 3xxx)
        return null;
    }
}
