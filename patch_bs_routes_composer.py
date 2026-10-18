import os

with open('src/api/modules/accounting/routes/AccountingRoutes.ts', 'r') as f:
    content = f.read()

content = content.replace(
    "import { TrialBalanceValidation } from '../validation/TrialBalanceValidation';",
    "import { TrialBalanceValidation } from '../validation/TrialBalanceValidation';\nimport { BalanceSheetController } from '../controllers/BalanceSheetController';\nimport { BalanceSheetValidation } from '../validation/BalanceSheetValidation';"
)

content = content.replace(
    "public static register(registry: RouteRegistry, controller: AccountController, journalController: JournalController, postingController: PostingController, trialBalanceController: TrialBalanceController, securityPipeline: SecurityPipeline): void {",
    "public static register(registry: RouteRegistry, controller: AccountController, journalController: JournalController, postingController: PostingController, trialBalanceController: TrialBalanceController, balanceSheetController: BalanceSheetController, securityPipeline: SecurityPipeline): void {"
)

bs_routes = """
        // Balance Sheet
        const bsPath = '/api/v1/organizations/:organizationId/accounting/balance-sheet';
        
        registry.register({
            path: bsPath,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('create', 'balance_sheet'),
                BalanceSheetValidation.validateGenerate
            ],
            handler: balanceSheetController.generateBalanceSheet
        });

        registry.register({
            path: `${bsPath}/compare`,
            method: HttpMethod.POST,
            middlewares: securityPipeline.buildSecureRoute('read', 'balance_sheet'),
            handler: balanceSheetController.compareBalanceSheets
        });

        registry.register({
            path: `${bsPath}/:id`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'balance_sheet'),
            handler: balanceSheetController.getBalanceSheet
        });

        registry.register({
            path: `${bsPath}/:id/validate`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'balance_sheet'),
            handler: balanceSheetController.validateBalanceSheet
        });

        registry.register({
            path: `${bsPath}/:id/export`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'balance_sheet'),
            handler: balanceSheetController.exportBalanceSheet
        });
    }
}
"""

content = content.replace("    }\n}", bs_routes)

with open('src/api/modules/accounting/routes/AccountingRoutes.ts', 'w') as f:
    f.write(content)

with open('src/api/modules/accounting/AccountingModule.ts', 'r') as f:
    module_content = f.read()

module_content = module_content.replace(
    "import { TrialBalanceController } from './controllers/TrialBalanceController';",
    "import { TrialBalanceController } from './controllers/TrialBalanceController';\nimport { BalanceSheetUseCases } from '../../../application/accounting/usecases/BalanceSheetUseCases';\nimport { BalanceSheetController } from './controllers/BalanceSheetController';"
)

module_content = module_content.replace(
    "const trialBalanceUseCases = resolver.resolve('trialBalanceUseCases') as TrialBalanceUseCases;",
    "const trialBalanceUseCases = resolver.resolve('trialBalanceUseCases') as TrialBalanceUseCases;\n        const balanceSheetUseCases = resolver.resolve('balanceSheetUseCases') as BalanceSheetUseCases;"
)

module_content = module_content.replace(
    "const trialBalanceController = new TrialBalanceController(trialBalanceUseCases);",
    "const trialBalanceController = new TrialBalanceController(trialBalanceUseCases);\n        const balanceSheetController = new BalanceSheetController(balanceSheetUseCases);"
)

module_content = module_content.replace(
    "AccountingRoutes.register(registry, controller, journalController, postingController, trialBalanceController, securityPipeline);",
    "AccountingRoutes.register(registry, controller, journalController, postingController, trialBalanceController, balanceSheetController, securityPipeline);"
)

with open('src/api/modules/accounting/AccountingModule.ts', 'w') as f:
    f.write(module_content)

print("Accounting routes patched for Balance Sheet")

with open('src/application/composition/ApplicationComposer.ts', 'r') as f:
    composer_content = f.read()

composer_content = composer_content.replace(
    "import { SupabaseLedgerEntryQuery } from '../../infrastructure/accounting/repositories/SupabaseLedgerEntryQuery';",
    "import { SupabaseLedgerEntryQuery } from '../../infrastructure/accounting/repositories/SupabaseLedgerEntryQuery';\nimport { SupabaseBalanceSheetRepository } from '../../infrastructure/accounting/repositories/SupabaseBalanceSheetRepository';\nimport { DefaultAccountClassificationService } from '../../infrastructure/accounting/services/DefaultAccountClassificationService';"
)

composer_content = composer_content.replace(
    "trialBalance: new SupabaseTrialBalanceRepository(db),",
    "trialBalance: new SupabaseTrialBalanceRepository(db),\n            balanceSheet: new SupabaseBalanceSheetRepository(db),\n            accountClassification: new DefaultAccountClassificationService(),"
)

composer_content = composer_content.replace(
    "import { TrialBalanceUseCases } from '../../application/accounting/usecases/TrialBalanceUseCases';",
    "import { TrialBalanceUseCases } from '../../application/accounting/usecases/TrialBalanceUseCases';\nimport { BalanceSheetUseCases } from '../../application/accounting/usecases/BalanceSheetUseCases';"
)

composer_content = composer_content.replace(
    "trialBalanceUseCases: new TrialBalanceUseCases(r.trialBalance, r.ledgerEntryQuery),",
    "trialBalanceUseCases: new TrialBalanceUseCases(r.trialBalance, r.ledgerEntryQuery),\n            balanceSheetUseCases: new BalanceSheetUseCases(r.balanceSheet, r.trialBalance, r.accountClassification),"
)

with open('src/application/composition/ApplicationComposer.ts', 'w') as f:
    f.write(composer_content)

print("Composer patched for Balance Sheet")
