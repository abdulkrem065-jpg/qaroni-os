import os

with open('src/application/accounting/usecases/EquityStatementUseCases.ts', 'r') as f:
    content = f.read()

content = content.replace("import { IEquityStatementRepository } from '../ports/IEquityStatementRepository';", "import { IEquityStatementRepository } from '../../../domain/accounting/repositories/IEquityStatementRepository';")
content = content.replace("import { IIncomeStatementRepository } from '../ports/IIncomeStatementRepository';", "import { IIncomeStatementRepository } from '../../../domain/accounting/repositories/IIncomeStatementRepository';")

with open('src/application/accounting/usecases/EquityStatementUseCases.ts', 'w') as f:
    f.write(content)
