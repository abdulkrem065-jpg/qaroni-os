import os

with open('src/application/accounting/usecases/FinancialRatiosUseCases.ts', 'r') as f:
    content = f.read()

content = content.replace(
    "const validations = await this.financialValidationRepo.findByOrganizationId(orgId);",
    "const validations = await this.financialValidationRepo.findByOrganization(orgId);"
)

totals_code = """
        const currentAssets = balanceSheet.sections.filter(s => s.subSection === 'CURRENT_ASSETS').reduce((sum, s) => sum + s.total, 0);
        const currentLiabilities = balanceSheet.sections.filter(s => s.subSection === 'CURRENT_LIABILITIES').reduce((sum, s) => sum + s.total, 0);
        
        const grossProfit = incomeStatement.calculateGrossProfit().value;
        const revenue = incomeStatement.calculateRevenueTotal().value;
        const netIncome = incomeStatement.calculateNetProfit().value;
        const operatingIncome = incomeStatement.calculateOperatingProfit().value;

        const totalAssets = balanceSheet.calculateAssetTotal().value;
        const totalLiabilities = balanceSheet.calculateLiabilityTotal().value;
        const totalEquity = balanceSheet.calculateEquityTotal().value;
"""

old_totals = """
        const totals = balanceSheet.calculateTotals();
        const currentAssets = totals.totalCurrentAssets.value;
        const currentLiabilities = totals.totalCurrentLiabilities.value;
        
        const isTotals = incomeStatement.calculateTotals();
        const grossProfit = isTotals.grossProfit.value;
        const revenue = isTotals.totalRevenue.value;
        const netIncome = isTotals.netIncome.value;
        const operatingIncome = isTotals.operatingIncome.value;

        // Solvency
        const totalAssets = totals.totalAssets.value;
        const totalLiabilities = totals.totalLiabilities.value;
        const totalEquity = totals.totalEquity.value;
"""

new_totals_code = totals_code + "\n        // Solvency"
content = content.replace(old_totals, new_totals_code)

with open('src/application/accounting/usecases/FinancialRatiosUseCases.ts', 'w') as f:
    f.write(content)

print("Use cases methods patched")
