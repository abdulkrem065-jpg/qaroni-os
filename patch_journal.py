import os

with open('src/domain/accounting/aggregates/Journal.ts', 'r') as f:
    content = f.read()

old_logic = """    public validateReadyForApproval(): void {
        if (this._lines.length < 2) {
            throw new BusinessRuleError('Journal must have at least two lines');
        }

        let totalDebit = 0;
        let totalCredit = 0;

        for (const line of this._lines) {
            totalDebit += line.debit.value;
            totalCredit += line.credit.value;
        }

        // Use epsilon for float comparison if needed, but assuming standard 2-decimal scaling or integers
        if (Math.abs(totalDebit - totalCredit) > 0.001) {
            throw new BusinessRuleError('Journal is not balanced: Total Debit must equal Total Credit');
        }
        
        if (totalDebit <= 0) {
            throw new BusinessRuleError('Journal cannot be empty');
        }
    }"""

new_logic = """    public validateReadyForApproval(): void {
        DoubleEntryEngine.validateJournal(this);
    }"""

content = content.replace(old_logic, new_logic)

with open('src/domain/accounting/aggregates/Journal.ts', 'w') as f:
    f.write(content)
