import os

with open('src/application/accounting/services/FinancialStatementBuilder.ts', 'r') as f:
    content = f.read()

old_cf = """        const cf = await this.cfUseCases.generateCashFlow({
            organizationId: req.organizationId,
            startBalanceSheetId: bs.id, 
            endBalanceSheetId: bs.id,
            incomeStatementId: is.id,
            startDate: req.startDate,
            endDate: req.endDate,
            openingCash: req.openingCashBalance,
            closingCash: req.closingCashBalance
        });"""

new_cf = """        const cf = await this.cfUseCases.generateCashFlow({
            organizationId: req.organizationId,
            startBalanceSheetId: bs.id, 
            endBalanceSheetId: bs.id,
            incomeStatementId: is.id,
            sections: []
        });"""

content = content.replace(old_cf, new_cf)

with open('src/application/accounting/services/FinancialStatementBuilder.ts', 'w') as f:
    f.write(content)
