# QEOS PERIOD CLOSING CONSTITUTION

## PURPOSE
To govern the strict sequence and requirements for closing accounting periods and rolling over balances.

## CHAPTER 4: CLOSING CONSTITUTION

### RULES
1. **Month-End Closing Rules**: Validates all journals for the month, calculates monthly profit/loss, locks the month against normal postings, and generates monthly statements.
2. **Quarter-End Closing Rules**: Aggregates monthly data, generates quarterly reports, and optionally handles quarterly tax provision adjustments.
3. **Year-End Closing Rules**: The supreme closing event. It encompasses all month/quarter rules plus the closure of temporary accounts.

### ENTRIES
1. **Closing Entries**: System-generated journal entries that debit Revenue accounts and credit Expense accounts (or vice versa depending on normal balance) to zero them out. 
2. **Opening Entries**: System-generated entries establishing the beginning balances for Permanent accounts in the new fiscal year.

### EQUITY TRANSFERS
* **Retained Earnings Transfer**: The net difference between Revenue and Expenses (Current Profit/Loss) is transferred to Retained Earnings at year-end.
* **Profit Carry Forward**: Positive net income increases Retained Earnings.
* **Loss Carry Forward**: Negative net income decreases Retained Earnings.
