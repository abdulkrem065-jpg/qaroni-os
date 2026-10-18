import os

with open('src/application/accounting/services/FinancialStatementBuilder.ts', 'r') as f:
    content = f.read()

# Fix generateTrialBalance params
old_tb = """        const tb = await this.tbUseCases.generateTrialBalance({
            organizationId: req.organizationId,
            periodId: req.periodId,
            startDate: req.startDate,
            endDate: req.endDate
        });"""
new_tb = """        const tb = await this.tbUseCases.generateTrialBalance({
            organizationId: req.organizationId,
            periodType: 'CUSTOM', // Or pass it via req
            startDate: req.startDate,
            endDate: req.endDate
        });"""
content = content.replace(old_tb, new_tb)

# Fix generateBalanceSheet params
old_bs = """        const bs = await this.bsUseCases.generateBalanceSheet({
            organizationId: req.organizationId,
            trialBalanceId: tb.id,
            periodStartDate: req.startDate,
            periodEndDate: req.endDate
        });"""
new_bs = """        const bs = await this.bsUseCases.generateBalanceSheet({
            organizationId: req.organizationId,
            trialBalanceId: tb.id
        });"""
content = content.replace(old_bs, new_bs)

# Fix generateCashFlow params
old_cf = """        const cf = await this.cfUseCases.generateCashFlowStatement({
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
            startDate: req.startDate,
            endDate: req.endDate,
            openingCash: req.openingCashBalance,
            closingCash: req.closingCashBalance
        });"""
content = content.replace(old_cf, new_cf)

with open('src/application/accounting/services/FinancialStatementBuilder.ts', 'w') as f:
    f.write(content)
