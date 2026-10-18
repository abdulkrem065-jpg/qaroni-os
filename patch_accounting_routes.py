import os

with open('src/api/modules/accounting/routes/AccountingRoutes.ts', 'r') as f:
    content = f.read()

content = content.replace(
    "import { PostingValidation } from '../validation/PostingValidation';",
    "import { PostingValidation } from '../validation/PostingValidation';\nimport { TrialBalanceController } from '../controllers/TrialBalanceController';\nimport { TrialBalanceValidation } from '../validation/TrialBalanceValidation';"
)

content = content.replace(
    "public static register(registry: RouteRegistry, controller: AccountController, journalController: JournalController, postingController: PostingController, securityPipeline: SecurityPipeline): void {",
    "public static register(registry: RouteRegistry, controller: AccountController, journalController: JournalController, postingController: PostingController, trialBalanceController: TrialBalanceController, securityPipeline: SecurityPipeline): void {"
)

tb_routes = """
        // Trial Balance
        const tbPath = '/api/v1/organizations/:organizationId/accounting/trial-balance';
        
        registry.register({
            path: tbPath,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('create', 'trial_balance'),
                TrialBalanceValidation.validateGenerate
            ],
            handler: trialBalanceController.generateTrialBalance
        });

        registry.register({
            path: `${tbPath}/compare`,
            method: HttpMethod.POST,
            middlewares: securityPipeline.buildSecureRoute('read', 'trial_balance'),
            handler: trialBalanceController.compareTrialBalances
        });

        registry.register({
            path: `${tbPath}/:id`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'trial_balance'),
            handler: trialBalanceController.getTrialBalance
        });

        registry.register({
            path: `${tbPath}/:id/validate`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'trial_balance'),
            handler: trialBalanceController.validateTrialBalance
        });

        registry.register({
            path: `${tbPath}/:id/export`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'trial_balance'),
            handler: trialBalanceController.exportTrialBalance
        });
    }
}
"""

content = content.replace("    }\n}", tb_routes)

with open('src/api/modules/accounting/routes/AccountingRoutes.ts', 'w') as f:
    f.write(content)

with open('src/api/modules/accounting/AccountingModule.ts', 'r') as f:
    module_content = f.read()

module_content = module_content.replace(
    "import { PostingController } from './controllers/PostingController';",
    "import { PostingController } from './controllers/PostingController';\nimport { TrialBalanceUseCases } from '../../../application/accounting/usecases/TrialBalanceUseCases';\nimport { TrialBalanceController } from './controllers/TrialBalanceController';"
)

module_content = module_content.replace(
    "const postingUseCases = resolver.resolve('postingUseCases') as PostingUseCases;",
    "const postingUseCases = resolver.resolve('postingUseCases') as PostingUseCases;\n        const trialBalanceUseCases = resolver.resolve('trialBalanceUseCases') as TrialBalanceUseCases;"
)

module_content = module_content.replace(
    "const postingController = new PostingController(postingUseCases);",
    "const postingController = new PostingController(postingUseCases);\n        const trialBalanceController = new TrialBalanceController(trialBalanceUseCases);"
)

module_content = module_content.replace(
    "AccountingRoutes.register(registry, controller, journalController, postingController, securityPipeline);",
    "AccountingRoutes.register(registry, controller, journalController, postingController, trialBalanceController, securityPipeline);"
)

with open('src/api/modules/accounting/AccountingModule.ts', 'w') as f:
    f.write(module_content)

print("Accounting routes patched for Trial Balance")
