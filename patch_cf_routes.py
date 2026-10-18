import os

with open('src/api/modules/accounting/routes/AccountingRoutes.ts', 'r') as f:
    content = f.read()

content = content.replace(
    "import { IncomeStatementValidation } from '../validation/IncomeStatementValidation';",
    "import { IncomeStatementValidation } from '../validation/IncomeStatementValidation';\nimport { CashFlowController } from '../controllers/CashFlowController';\nimport { CashFlowValidation } from '../validation/CashFlowValidation';"
)

content = content.replace(
    "incomeStatementController: IncomeStatementController, securityPipeline: SecurityPipeline",
    "incomeStatementController: IncomeStatementController, cashFlowController: CashFlowController, securityPipeline: SecurityPipeline"
)

cf_routes = """
        // Cash Flow Statement
        const cfPath = '/api/v1/organizations/:organizationId/accounting/cash-flow';
        
        registry.register({
            path: cfPath,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('create', 'cash_flow'),
                CashFlowValidation.validateGenerate
            ],
            handler: cashFlowController.generateCashFlow
        });

        registry.register({
            path: `${cfPath}/compare`,
            method: HttpMethod.POST,
            middlewares: securityPipeline.buildSecureRoute('read', 'cash_flow'),
            handler: cashFlowController.compareCashFlows
        });

        registry.register({
            path: `${cfPath}/:id`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'cash_flow'),
            handler: cashFlowController.getCashFlow
        });

        registry.register({
            path: `${cfPath}/:id/validate`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'cash_flow'),
            handler: cashFlowController.validateCashFlow
        });

        registry.register({
            path: `${cfPath}/:id/export`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'cash_flow'),
            handler: cashFlowController.exportCashFlow
        });
    }
}
"""

content = content.replace("    }\n}", cf_routes)

with open('src/api/modules/accounting/routes/AccountingRoutes.ts', 'w') as f:
    f.write(content)

with open('src/api/modules/accounting/AccountingModule.ts', 'r') as f:
    module_content = f.read()

module_content = module_content.replace(
    "import { IncomeStatementController } from './controllers/IncomeStatementController';",
    "import { IncomeStatementController } from './controllers/IncomeStatementController';\nimport { CashFlowUseCases } from '../../../application/accounting/usecases/CashFlowUseCases';\nimport { CashFlowController } from './controllers/CashFlowController';"
)

module_content = module_content.replace(
    "const incomeStatementUseCases = resolver.resolve('incomeStatementUseCases') as IncomeStatementUseCases;",
    "const incomeStatementUseCases = resolver.resolve('incomeStatementUseCases') as IncomeStatementUseCases;\n        const cashFlowUseCases = resolver.resolve('cashFlowUseCases') as CashFlowUseCases;"
)

module_content = module_content.replace(
    "const incomeStatementController = new IncomeStatementController(incomeStatementUseCases);",
    "const incomeStatementController = new IncomeStatementController(incomeStatementUseCases);\n        const cashFlowController = new CashFlowController(cashFlowUseCases);"
)

module_content = module_content.replace(
    "financialValidationController, incomeStatementController, securityPipeline);",
    "financialValidationController, incomeStatementController, cashFlowController, securityPipeline);"
)

with open('src/api/modules/accounting/AccountingModule.ts', 'w') as f:
    f.write(module_content)

print("Accounting routes patched for Cash Flow")

with open('src/application/composition/ApplicationComposer.ts', 'r') as f:
    composer_content = f.read()

composer_content = composer_content.replace(
    "import { SupabaseIncomeStatementRepository } from '../../infrastructure/accounting/repositories/SupabaseIncomeStatementRepository';",
    "import { SupabaseIncomeStatementRepository } from '../../infrastructure/accounting/repositories/SupabaseIncomeStatementRepository';\nimport { SupabaseCashFlowRepository } from '../../infrastructure/accounting/repositories/SupabaseCashFlowRepository';"
)

composer_content = composer_content.replace(
    "incomeStatement: new SupabaseIncomeStatementRepository(db),",
    "incomeStatement: new SupabaseIncomeStatementRepository(db),\n            cashFlow: new SupabaseCashFlowRepository(db),"
)

composer_content = composer_content.replace(
    "import { IncomeStatementUseCases } from '../../application/accounting/usecases/IncomeStatementUseCases';",
    "import { IncomeStatementUseCases } from '../../application/accounting/usecases/IncomeStatementUseCases';\nimport { CashFlowUseCases } from '../../application/accounting/usecases/CashFlowUseCases';"
)

composer_content = composer_content.replace(
    "incomeStatementUseCases: new IncomeStatementUseCases(r.incomeStatement, r.trialBalance, r.financialValidation, r.incomeClassification, e),",
    "incomeStatementUseCases: new IncomeStatementUseCases(r.incomeStatement, r.trialBalance, r.financialValidation, r.incomeClassification, e),\n            cashFlowUseCases: new CashFlowUseCases(r.cashFlow, r.balanceSheet, r.incomeStatement, r.financialValidation, e),"
)

with open('src/application/composition/ApplicationComposer.ts', 'w') as f:
    f.write(composer_content)

print("Composer patched for Cash Flow")
