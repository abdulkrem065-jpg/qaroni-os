import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

# Validation
create_file('src/api/modules/accounting/validation/PostingValidation.ts', """import { Request, Response, NextFunction } from 'express';

export class PostingValidation {
    public static validateExecutePosting(req: Request, res: Response, next: NextFunction): void {
        const { journalIds } = req.body;
        const errors = [];

        if (!journalIds || !Array.isArray(journalIds) || journalIds.length === 0) {
            errors.push('journalIds is required and must be a non-empty array of strings');
        } else {
            for (const id of journalIds) {
                if (typeof id !== 'string') {
                    errors.push('All journalIds must be strings');
                    break;
                }
            }
        }

        if (errors.length > 0) {
            res.status(400).json({ error: 'Validation failed', details: errors });
            return;
        }
        next();
    }
}
""")

# Controller
create_file('src/api/modules/accounting/controllers/PostingController.ts', """import { Request, Response } from 'express';
import { PostingUseCases } from '../../../../application/accounting/usecases/PostingUseCases';
import { BusinessRuleError } from '../../../../domain/shared/errors/BusinessRuleError';

export class PostingController {
    constructor(private readonly useCases: PostingUseCases) {
        this.executePosting = this.executePosting.bind(this);
        this.validatePosting = this.validatePosting.bind(this);
        this.getPostingHistory = this.getPostingHistory.bind(this);
        this.retryFailedPosting = this.retryFailedPosting.bind(this);
        this.lockPosting = this.lockPosting.bind(this);
    }

    public async executePosting(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.useCases.executePosting({
                organizationId: req.params.organizationId,
                ...req.body
            });
            res.status(200).json(result); // 200 since it returns the batch
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(400).json({ error: error.message });
            else res.status(500).json({ error: 'Internal server error' });
        }
    }

    public async validatePosting(req: Request, res: Response): Promise<void> {
        try {
            const journalIds = req.body.journalIds || [];
            if (!Array.isArray(journalIds)) {
                 res.status(400).json({ error: 'journalIds must be an array' });
                 return;
            }
            const result = await this.useCases.validatePosting(req.params.organizationId, journalIds);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    public async getPostingHistory(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.useCases.getPostingHistory(req.params.organizationId);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    public async retryFailedPosting(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.useCases.retryFailedPosting(req.params.organizationId, req.params.batchId);
            res.status(200).json(result);
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(400).json({ error: error.message });
            else res.status(500).json({ error: 'Internal server error' });
        }
    }

    public async lockPosting(req: Request, res: Response): Promise<void> {
        try {
            await this.useCases.lockPosting(req.params.organizationId, req.params.batchId);
            res.status(204).send();
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(400).json({ error: error.message });
            else res.status(500).json({ error: 'Internal server error' });
        }
    }
}
""")

print("Posting API generated")
