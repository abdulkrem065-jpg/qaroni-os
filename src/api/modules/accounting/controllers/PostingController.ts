import { Request, Response } from 'express';
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
