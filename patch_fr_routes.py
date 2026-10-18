import os

with open('src/api/modules/accounting/routes/AccountingRoutes.ts', 'r') as f:
    content = f.read()

content = content.replace(
    "import { CashFlowValidation } from '../validation/CashFlowValidation';",
    "import { CashFlowValidation } from '../validation/CashFlowValidation';\nimport { FinancialRatiosController } from '../controllers/FinancialRatiosController';\nimport { FinancialRatiosValidation } from '../validation/FinancialRatiosValidation';"
)

content = content.replace(
    "cashFlowController: CashFlowController, securityPipeline: SecurityPipeline",
    "cashFlowController: CashFlowController, financialRatiosController: FinancialRatiosController, securityPipeline: SecurityPipeline"
)

fr_routes = """
        // Financial Ratios
        const frPath = '/api/v1/organizations/:organizationId/accounting/financial-ratios';
        
        registry.register({
            path: frPath,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('create', 'financial_ratios'),
                FinancialRatiosValidation.validateGenerate
            ],
            handler: financialRatiosController.generateRatios
        });

        registry.register({
            path: `${frPath}/compare`,
            method: HttpMethod.POST,
            middlewares: securityPipeline.buildSecureRoute('read', 'financial_ratios'),
            handler: financialRatiosController.compareRatios
        });

        registry.register({
            path: `${frPath}/:id`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'financial_ratios'),
            handler: financialRatiosController.getRatios
        });

        registry.register({
            path: `${frPath}/:id/validate`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'financial_ratios'),
            handler: financialRatiosController.validateRatios
        });
    }
}
"""

content = content.replace("    }\n}", fr_routes)

with open('src/api/modules/accounting/routes/AccountingRoutes.ts', 'w') as f:
    f.write(content)

with open('src/api/modules/accounting/AccountingModule.ts', 'r') as f:
    module_content = f.read()

module_content = module_content.replace(
    "import { CashFlowController } from './controllers/CashFlowController';",
    "import { CashFlowController } from './controllers/CashFlowController';\nimport { FinancialRatiosUseCases } from '../../../application/accounting/usecases/FinancialRatiosUseCases';\nimport { FinancialRatiosController } from './controllers/FinancialRatiosController';"
)

module_content = module_content.replace(
    "const cashFlowUseCases = resolver.resolve('cashFlowUseCases') as CashFlowUseCases;",
    "const cashFlowUseCases = resolver.resolve('cashFlowUseCases') as CashFlowUseCases;\n        const financialRatiosUseCases = resolver.resolve('financialRatiosUseCases') as FinancialRatiosUseCases;"
)

module_content = module_content.replace(
    "const cashFlowController = new CashFlowController(cashFlowUseCases);",
    "const cashFlowController = new CashFlowController(cashFlowUseCases);\n        const financialRatiosController = new FinancialRatiosController(financialRatiosUseCases);"
)

module_content = module_content.replace(
    "incomeStatementController, cashFlowController, securityPipeline);",
    "incomeStatementController, cashFlowController, financialRatiosController, securityPipeline);"
)

with open('src/api/modules/accounting/AccountingModule.ts', 'w') as f:
    f.write(module_content)

print("Accounting routes patched for Financial Ratios")

with open('src/application/composition/ApplicationComposer.ts', 'r') as f:
    composer_content = f.read()

composer_content = composer_content.replace(
    "import { SupabaseCashFlowRepository } from '../../infrastructure/accounting/repositories/SupabaseCashFlowRepository';",
    "import { SupabaseCashFlowRepository } from '../../infrastructure/accounting/repositories/SupabaseCashFlowRepository';\nimport { SupabaseFinancialRatiosRepository } from '../../infrastructure/accounting/repositories/SupabaseFinancialRatiosRepository';"
)

composer_content = composer_content.replace(
    "cashFlow: new SupabaseCashFlowRepository(db),",
    "cashFlow: new SupabaseCashFlowRepository(db),\n            financialRatios: new SupabaseFinancialRatiosRepository(db),"
)

composer_content = composer_content.replace(
    "import { CashFlowUseCases } from '../../application/accounting/usecases/CashFlowUseCases';",
    "import { CashFlowUseCases } from '../../application/accounting/usecases/CashFlowUseCases';\nimport { FinancialRatiosUseCases } from '../../application/accounting/usecases/FinancialRatiosUseCases';"
)

composer_content = composer_content.replace(
    "cashFlowUseCases: new CashFlowUseCases(r.cashFlow, r.balanceSheet, r.incomeStatement, r.financialValidation, e),",
    "cashFlowUseCases: new CashFlowUseCases(r.cashFlow, r.balanceSheet, r.incomeStatement, r.financialValidation, e),\n            financialRatiosUseCases: new FinancialRatiosUseCases(r.financialRatios, r.balanceSheet, r.incomeStatement, r.cashFlow, r.financialValidation, e),"
)

with open('src/application/composition/ApplicationComposer.ts', 'w') as f:
    f.write(composer_content)

print("Composer patched for Financial Ratios")
