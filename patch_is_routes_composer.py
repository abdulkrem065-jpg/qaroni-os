import os

with open('src/api/modules/accounting/routes/AccountingRoutes.ts', 'r') as f:
    content = f.read()

content = content.replace(
    "import { FinancialValidationRequestValidation } from '../validation/FinancialValidationRequestValidation';",
    "import { FinancialValidationRequestValidation } from '../validation/FinancialValidationRequestValidation';\nimport { IncomeStatementController } from '../controllers/IncomeStatementController';\nimport { IncomeStatementValidation } from '../validation/IncomeStatementValidation';"
)

content = content.replace(
    "public static register(registry: RouteRegistry, controller: AccountController, journalController: JournalController, postingController: PostingController, trialBalanceController: TrialBalanceController, balanceSheetController: BalanceSheetController, financialValidationController: FinancialValidationController, securityPipeline: SecurityPipeline): void {",
    "public static register(registry: RouteRegistry, controller: AccountController, journalController: JournalController, postingController: PostingController, trialBalanceController: TrialBalanceController, balanceSheetController: BalanceSheetController, financialValidationController: FinancialValidationController, incomeStatementController: IncomeStatementController, securityPipeline: SecurityPipeline): void {"
)

is_routes = """
        // Income Statement
        const isPath = '/api/v1/organizations/:organizationId/accounting/income-statement';
        
        registry.register({
            path: isPath,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('create', 'income_statement'),
                IncomeStatementValidation.validateGenerate
            ],
            handler: incomeStatementController.generateIncomeStatement
        });

        registry.register({
            path: `${isPath}/compare`,
            method: HttpMethod.POST,
            middlewares: securityPipeline.buildSecureRoute('read', 'income_statement'),
            handler: incomeStatementController.compareIncomeStatements
        });

        registry.register({
            path: `${isPath}/:id`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'income_statement'),
            handler: incomeStatementController.getIncomeStatement
        });

        registry.register({
            path: `${isPath}/:id/validate`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'income_statement'),
            handler: incomeStatementController.validateIncomeStatement
        });

        registry.register({
            path: `${isPath}/:id/export`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'income_statement'),
            handler: incomeStatementController.exportIncomeStatement
        });
    }
}
"""

content = content.replace("    }\n}", is_routes)

with open('src/api/modules/accounting/routes/AccountingRoutes.ts', 'w') as f:
    f.write(content)

with open('src/api/modules/accounting/AccountingModule.ts', 'r') as f:
    module_content = f.read()

module_content = module_content.replace(
    "import { FinancialValidationController } from './controllers/FinancialValidationController';",
    "import { FinancialValidationController } from './controllers/FinancialValidationController';\nimport { IncomeStatementUseCases } from '../../../application/accounting/usecases/IncomeStatementUseCases';\nimport { IncomeStatementController } from './controllers/IncomeStatementController';"
)

module_content = module_content.replace(
    "const financialValidationUseCases = resolver.resolve('financialValidationUseCases') as FinancialValidationUseCases;",
    "const financialValidationUseCases = resolver.resolve('financialValidationUseCases') as FinancialValidationUseCases;\n        const incomeStatementUseCases = resolver.resolve('incomeStatementUseCases') as IncomeStatementUseCases;"
)

module_content = module_content.replace(
    "const financialValidationController = new FinancialValidationController(financialValidationUseCases);",
    "const financialValidationController = new FinancialValidationController(financialValidationUseCases);\n        const incomeStatementController = new IncomeStatementController(incomeStatementUseCases);"
)

module_content = module_content.replace(
    "AccountingRoutes.register(registry, controller, journalController, postingController, trialBalanceController, balanceSheetController, financialValidationController, securityPipeline);",
    "AccountingRoutes.register(registry, controller, journalController, postingController, trialBalanceController, balanceSheetController, financialValidationController, incomeStatementController, securityPipeline);"
)

with open('src/api/modules/accounting/AccountingModule.ts', 'w') as f:
    f.write(module_content)

print("Accounting routes patched for Income Statement")

with open('src/application/composition/ApplicationComposer.ts', 'r') as f:
    composer_content = f.read()

composer_content = composer_content.replace(
    "import { SupabaseFinancialValidationRepository } from '../../infrastructure/accounting/repositories/SupabaseFinancialValidationRepository';",
    "import { SupabaseFinancialValidationRepository } from '../../infrastructure/accounting/repositories/SupabaseFinancialValidationRepository';\nimport { SupabaseIncomeStatementRepository } from '../../infrastructure/accounting/repositories/SupabaseIncomeStatementRepository';\nimport { DefaultIncomeStatementClassificationService } from '../../infrastructure/accounting/services/DefaultIncomeStatementClassificationService';"
)

composer_content = composer_content.replace(
    "financialValidation: new SupabaseFinancialValidationRepository(db),",
    "financialValidation: new SupabaseFinancialValidationRepository(db),\n            incomeStatement: new SupabaseIncomeStatementRepository(db),\n            incomeClassification: new DefaultIncomeStatementClassificationService(),"
)

composer_content = composer_content.replace(
    "import { FinancialValidationUseCases } from '../../application/accounting/usecases/FinancialValidationUseCases';",
    "import { FinancialValidationUseCases } from '../../application/accounting/usecases/FinancialValidationUseCases';\nimport { IncomeStatementUseCases } from '../../application/accounting/usecases/IncomeStatementUseCases';"
)

composer_content = composer_content.replace(
    "financialValidationUseCases: new FinancialValidationUseCases(r.financialValidation, r.account, r.posting, r.trialBalance, r.balanceSheet, r.ledgerEntryQuery, e),",
    "financialValidationUseCases: new FinancialValidationUseCases(r.financialValidation, r.account, r.posting, r.trialBalance, r.balanceSheet, r.ledgerEntryQuery, e),\n            incomeStatementUseCases: new IncomeStatementUseCases(r.incomeStatement, r.trialBalance, r.financialValidation, r.incomeClassification, e),"
)

with open('src/application/composition/ApplicationComposer.ts', 'w') as f:
    f.write(composer_content)

print("Composer patched for Income Statement")
