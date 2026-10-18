import os

with open('src/api/modules/accounting/routes/AccountingRoutes.ts', 'r') as f:
    content = f.read()

content = content.replace(
    "import { JournalValidation } from '../validation/JournalValidation';",
    "import { JournalValidation } from '../validation/JournalValidation';\nimport { PostingController } from '../controllers/PostingController';\nimport { PostingValidation } from '../validation/PostingValidation';"
)

content = content.replace(
    "public static register(registry: RouteRegistry, controller: AccountController, journalController: JournalController, securityPipeline: SecurityPipeline): void {",
    "public static register(registry: RouteRegistry, controller: AccountController, journalController: JournalController, postingController: PostingController, securityPipeline: SecurityPipeline): void {"
)

posting_routes = """
        // Postings
        const postingPath = '/api/v1/organizations/:organizationId/accounting/postings';
        
        registry.register({
            path: postingPath,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'posting'),
            handler: postingController.getPostingHistory
        });

        registry.register({
            path: postingPath,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('create', 'posting'),
                PostingValidation.validateExecutePosting
            ],
            handler: postingController.executePosting
        });

        registry.register({
            path: `${postingPath}/validate`,
            method: HttpMethod.POST,
            middlewares: securityPipeline.buildSecureRoute('read', 'posting'),
            handler: postingController.validatePosting
        });

        registry.register({
            path: `${postingPath}/:batchId/retry`,
            method: HttpMethod.POST,
            middlewares: securityPipeline.buildSecureRoute('update', 'posting'),
            handler: postingController.retryFailedPosting
        });

        registry.register({
            path: `${postingPath}/:batchId/lock`,
            method: HttpMethod.PATCH,
            middlewares: securityPipeline.buildSecureRoute('update', 'posting'),
            handler: postingController.lockPosting
        });
    }
}
"""

content = content.replace("    }\n}", posting_routes)

with open('src/api/modules/accounting/routes/AccountingRoutes.ts', 'w') as f:
    f.write(content)

with open('src/api/modules/accounting/AccountingModule.ts', 'r') as f:
    module_content = f.read()

module_content = module_content.replace(
    "import { JournalController } from './controllers/JournalController';",
    "import { JournalController } from './controllers/JournalController';\nimport { PostingUseCases } from '../../../application/accounting/usecases/PostingUseCases';\nimport { PostingController } from './controllers/PostingController';"
)

module_content = module_content.replace(
    "const journalUseCases = resolver.resolve('journalUseCases') as JournalUseCases;",
    "const journalUseCases = resolver.resolve('journalUseCases') as JournalUseCases;\n        const postingUseCases = resolver.resolve('postingUseCases') as PostingUseCases;"
)

module_content = module_content.replace(
    "const journalController = new JournalController(journalUseCases);",
    "const journalController = new JournalController(journalUseCases);\n        const postingController = new PostingController(postingUseCases);"
)

module_content = module_content.replace(
    "AccountingRoutes.register(registry, controller, journalController, securityPipeline);",
    "AccountingRoutes.register(registry, controller, journalController, postingController, securityPipeline);"
)

with open('src/api/modules/accounting/AccountingModule.ts', 'w') as f:
    f.write(module_content)

print("Posting API routes patched")
