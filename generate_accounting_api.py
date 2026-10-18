import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

# Validation
create_file('src/api/modules/accounting/validation/AccountValidation.ts', """import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export class AccountValidation {
    public static validateCreateAccount(req: Request, res: Response, next: NextFunction): void {
        const schema = z.object({
            code: z.string().min(1).regex(/^[A-Za-z0-9-_.]+$/),
            name: z.string().min(1),
            type: z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']),
            category: z.string().min(1),
            normalBalance: z.enum(['DEBIT', 'CREDIT']),
            isHeader: z.boolean(),
            parentId: z.string().uuid().optional()
        });

        try {
            schema.parse(req.body);
            next();
        } catch (error: any) {
            res.status(400).json({ error: 'Invalid account data', details: error.errors });
        }
    }

    public static validateUpdateAccount(req: Request, res: Response, next: NextFunction): void {
        const schema = z.object({
            name: z.string().min(1),
            category: z.string().min(1)
        });

        try {
            schema.parse(req.body);
            next();
        } catch (error: any) {
            res.status(400).json({ error: 'Invalid update data', details: error.errors });
        }
    }

    public static validateMoveAccount(req: Request, res: Response, next: NextFunction): void {
        const schema = z.object({
            newParentId: z.string().uuid().optional().nullable()
        });

        try {
            schema.parse(req.body);
            next();
        } catch (error: any) {
            res.status(400).json({ error: 'Invalid move data', details: error.errors });
        }
    }
}
""")

# Controller
create_file('src/api/modules/accounting/controllers/AccountController.ts', """import { Request, Response } from 'express';
import { AccountUseCases } from '../../../../application/accounting/usecases/AccountUseCases';
import { BusinessRuleError } from '../../../../domain/shared/errors/BusinessRuleError';

export class AccountController {
    constructor(private readonly useCases: AccountUseCases) {
        this.createAccount = this.createAccount.bind(this);
        this.updateAccount = this.updateAccount.bind(this);
        this.archiveAccount = this.archiveAccount.bind(this);
        this.restoreAccount = this.restoreAccount.bind(this);
        this.moveAccount = this.moveAccount.bind(this);
        this.getAccount = this.getAccount.bind(this);
        this.listAccounts = this.listAccounts.bind(this);
    }

    public async createAccount(req: Request, res: Response): Promise<void> {
        try {
            const organizationId = req.params.organizationId;
            const dto = { organizationId, ...req.body };
            const result = await this.useCases.createAccount(dto);
            res.status(201).json(result);
        } catch (error: any) {
            if (error instanceof BusinessRuleError) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }

    public async updateAccount(req: Request, res: Response): Promise<void> {
        try {
            const organizationId = req.params.organizationId;
            const accountId = req.params.accountId;
            const dto = { organizationId, accountId, ...req.body };
            await this.useCases.updateAccount(dto);
            res.status(204).send();
        } catch (error: any) {
            if (error instanceof BusinessRuleError) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }

    public async archiveAccount(req: Request, res: Response): Promise<void> {
        try {
            const organizationId = req.params.organizationId;
            const accountId = req.params.accountId;
            await this.useCases.archiveAccount(organizationId, accountId);
            res.status(204).send();
        } catch (error: any) {
            if (error instanceof BusinessRuleError) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }

    public async restoreAccount(req: Request, res: Response): Promise<void> {
        try {
            const organizationId = req.params.organizationId;
            const accountId = req.params.accountId;
            await this.useCases.restoreAccount(organizationId, accountId);
            res.status(204).send();
        } catch (error: any) {
            if (error instanceof BusinessRuleError) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }

    public async moveAccount(req: Request, res: Response): Promise<void> {
        try {
            const organizationId = req.params.organizationId;
            const accountId = req.params.accountId;
            const dto = { organizationId, accountId, newParentId: req.body.newParentId || undefined };
            await this.useCases.moveAccount(dto);
            res.status(204).send();
        } catch (error: any) {
            if (error instanceof BusinessRuleError) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }

    public async getAccount(req: Request, res: Response): Promise<void> {
        try {
            const organizationId = req.params.organizationId;
            const accountId = req.params.accountId;
            const result = await this.useCases.getAccount(organizationId, accountId);
            if (!result) {
                res.status(404).json({ error: 'Account not found' });
            } else {
                res.status(200).json(result);
            }
        } catch (error: any) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    public async listAccounts(req: Request, res: Response): Promise<void> {
        try {
            const organizationId = req.params.organizationId;
            const result = await this.useCases.listAccounts(organizationId);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
""")

# Routes
create_file('src/api/modules/accounting/routes/AccountingRoutes.ts', """import { RouteRegistry, HttpMethod } from '../../../routing/RouteRegistry';
import { AccountController } from '../controllers/AccountController';
import { AccountValidation } from '../validation/AccountValidation';
import { SecurityPipeline } from '../../../security/SecurityPipeline';

export class AccountingRoutes {
    public static register(registry: RouteRegistry, controller: AccountController, securityPipeline: SecurityPipeline): void {
        const basePath = '/api/v1/organizations/:organizationId/accounting/accounts';

        registry.register({
            path: basePath,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'account'),
            handler: controller.listAccounts
        });

        registry.register({
            path: `${basePath}/:accountId`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'account'),
            handler: controller.getAccount
        });

        registry.register({
            path: basePath,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('create', 'account'),
                AccountValidation.validateCreateAccount
            ],
            handler: controller.createAccount
        });

        registry.register({
            path: `${basePath}/:accountId`,
            method: HttpMethod.PUT,
            middlewares: [
                ...securityPipeline.buildSecureRoute('update', 'account'),
                AccountValidation.validateUpdateAccount
            ],
            handler: controller.updateAccount
        });

        registry.register({
            path: `${basePath}/:accountId/archive`,
            method: HttpMethod.PATCH,
            middlewares: securityPipeline.buildSecureRoute('delete', 'account'), // soft delete uses delete permission usually
            handler: controller.archiveAccount
        });

        registry.register({
            path: `${basePath}/:accountId/restore`,
            method: HttpMethod.PATCH,
            middlewares: securityPipeline.buildSecureRoute('update', 'account'),
            handler: controller.restoreAccount
        });

        registry.register({
            path: `${basePath}/:accountId/move`,
            method: HttpMethod.PATCH,
            middlewares: [
                ...securityPipeline.buildSecureRoute('update', 'account'),
                AccountValidation.validateMoveAccount
            ],
            handler: controller.moveAccount
        });
    }
}
""")

print("Accounting API layer generated")
