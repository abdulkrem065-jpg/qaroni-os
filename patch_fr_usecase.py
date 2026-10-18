import os

with open('src/application/accounting/usecases/FinancialRatiosUseCases.ts', 'r') as f:
    content = f.read()

content = content.replace(
    "import { IBalanceSheetRepository } from '../ports/IBalanceSheetRepository';",
    "import { IBalanceSheetRepository } from '../../../domain/accounting/repositories/IBalanceSheetRepository';"
)
content = content.replace(
    "import { IIncomeStatementRepository } from '../ports/IIncomeStatementRepository';",
    "import { IIncomeStatementRepository } from '../../../domain/accounting/repositories/IIncomeStatementRepository';"
)
content = content.replace(
    "import { ICashFlowRepository } from '../ports/ICashFlowRepository';",
    "import { ICashFlowRepository } from '../../../domain/accounting/repositories/ICashFlowRepository';"
)
content = content.replace(
    "import { IFinancialValidationRepository } from '../ports/IFinancialValidationRepository';",
    "import { IFinancialValidationRepository } from '../../../domain/accounting/repositories/IFinancialValidationRepository';"
)
content = content.replace(
    "import { IEventDispatcher } from '../../../domain/shared/core/IEventDispatcher';",
    "import { IEventDispatcher } from '../../shared/core/IEventDispatcher';"
)
content = content.replace(
    "ratios.clearEvents();",
    "ratios.clearDomainEvents();"
)

with open('src/application/accounting/usecases/FinancialRatiosUseCases.ts', 'w') as f:
    f.write(content)
print("Updated FinancialRatiosUseCases.ts imports and methods")
