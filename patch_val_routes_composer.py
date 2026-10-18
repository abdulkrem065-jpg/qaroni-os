import os

with open('src/api/modules/accounting/routes/AccountingRoutes.ts', 'r') as f:
    content = f.read()

content = content.replace(
    "import { BalanceSheetValidation } from '../validation/BalanceSheetValidation';",
    "import { BalanceSheetValidation } from '../validation/BalanceSheetValidation';\nimport { FinancialValidationController } from '../controllers/FinancialValidationController';\nimport { FinancialValidationRequestValidation } from '../validation/FinancialValidationRequestValidation';"
)

content = content.replace(
    "public static register(registry: RouteRegistry, controller: AccountController, journalController: JournalController, postingController: PostingController, trialBalanceController: TrialBalanceController, balanceSheetController: BalanceSheetController, securityPipeline: SecurityPipeline): void {",
    "public static register(registry: RouteRegistry, controller: AccountController, journalController: JournalController, postingController: PostingController, trialBalanceController: TrialBalanceController, balanceSheetController: BalanceSheetController, financialValidationController: FinancialValidationController, securityPipeline: SecurityPipeline): void {"
)

val_routes = """
        // Financial Validation
        const valPath = '/api/v1/organizations/:organizationId/accounting/validation';
        
        registry.register({
            path: valPath,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('create', 'financial_validation'),
                FinancialValidationRequestValidation.validateExecute
            ],
            handler: financialValidationController.executeValidation
        });

        registry.register({
            path: valPath,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'financial_validation'),
            handler: financialValidationController.getValidationHistory
        });
    }
}
"""

content = content.replace("    }\n}", val_routes)

with open('src/api/modules/accounting/routes/AccountingRoutes.ts', 'w') as f:
    f.write(content)

with open('src/api/modules/accounting/AccountingModule.ts', 'r') as f:
    module_content = f.read()

module_content = module_content.replace(
    "import { BalanceSheetController } from './controllers/BalanceSheetController';",
    "import { BalanceSheetController } from './controllers/BalanceSheetController';\nimport { FinancialValidationUseCases } from '../../../application/accounting/usecases/FinancialValidationUseCases';\nimport { FinancialValidationController } from './controllers/FinancialValidationController';"
)

module_content = module_content.replace(
    "const balanceSheetUseCases = resolver.resolve('balanceSheetUseCases') as BalanceSheetUseCases;",
    "const balanceSheetUseCases = resolver.resolve('balanceSheetUseCases') as BalanceSheetUseCases;\n        const financialValidationUseCases = resolver.resolve('financialValidationUseCases') as FinancialValidationUseCases;"
)

module_content = module_content.replace(
    "const balanceSheetController = new BalanceSheetController(balanceSheetUseCases);",
    "const balanceSheetController = new BalanceSheetController(balanceSheetUseCases);\n        const financialValidationController = new FinancialValidationController(financialValidationUseCases);"
)

module_content = module_content.replace(
    "AccountingRoutes.register(registry, controller, journalController, postingController, trialBalanceController, balanceSheetController, securityPipeline);",
    "AccountingRoutes.register(registry, controller, journalController, postingController, trialBalanceController, balanceSheetController, financialValidationController, securityPipeline);"
)

with open('src/api/modules/accounting/AccountingModule.ts', 'w') as f:
    f.write(module_content)

print("Accounting routes patched for Financial Validation")

with open('src/application/composition/ApplicationComposer.ts', 'r') as f:
    composer_content = f.read()

composer_content = composer_content.replace(
    "import { SupabaseBalanceSheetRepository } from '../../infrastructure/accounting/repositories/SupabaseBalanceSheetRepository';",
    "import { SupabaseBalanceSheetRepository } from '../../infrastructure/accounting/repositories/SupabaseBalanceSheetRepository';\nimport { SupabaseFinancialValidationRepository } from '../../infrastructure/accounting/repositories/SupabaseFinancialValidationRepository';"
)

composer_content = composer_content.replace(
    "balanceSheet: new SupabaseBalanceSheetRepository(db),",
    "balanceSheet: new SupabaseBalanceSheetRepository(db),\n            financialValidation: new SupabaseFinancialValidationRepository(db),"
)

composer_content = composer_content.replace(
    "import { BalanceSheetUseCases } from '../../application/accounting/usecases/BalanceSheetUseCases';",
    "import { BalanceSheetUseCases } from '../../application/accounting/usecases/BalanceSheetUseCases';\nimport { FinancialValidationUseCases } from '../../application/accounting/usecases/FinancialValidationUseCases';"
)

composer_content = composer_content.replace(
    "balanceSheetUseCases: new BalanceSheetUseCases(r.balanceSheet, r.trialBalance, r.accountClassification),",
    "balanceSheetUseCases: new BalanceSheetUseCases(r.balanceSheet, r.trialBalance, r.accountClassification),\n            financialValidationUseCases: new FinancialValidationUseCases(r.financialValidation, r.account, r.posting, r.trialBalance, r.balanceSheet, r.ledgerEntryQuery, e),"
)

with open('src/application/composition/ApplicationComposer.ts', 'w') as f:
    f.write(composer_content)

print("Composer patched for Financial Validation")
