import { Request, Response } from 'express';
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
