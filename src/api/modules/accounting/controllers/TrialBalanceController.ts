import { Request, Response } from 'express';
import { TrialBalanceUseCases } from '../../../../application/accounting/usecases/TrialBalanceUseCases';
import { BusinessRuleError } from '../../../../domain/shared/errors/BusinessRuleError';

export class TrialBalanceController {
    constructor(private readonly useCases: TrialBalanceUseCases) {
        this.generateTrialBalance = this.generateTrialBalance.bind(this);
        this.getTrialBalance = this.getTrialBalance.bind(this);
        this.validateTrialBalance = this.validateTrialBalance.bind(this);
        this.compareTrialBalances = this.compareTrialBalances.bind(this);
        this.exportTrialBalance = this.exportTrialBalance.bind(this);
    }

    public async generateTrialBalance(req: Request, res: Response): Promise<void> {
        try {
            const dto = {
                organizationId: req.params.organizationId,
                ...req.body
            };
            const result = await this.useCases.generateTrialBalance(dto);
            res.status(201).json(result);
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(400).json({ error: error.message });
            else res.status(500).json({ error: error.message });
        }
    }

    public async getTrialBalance(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.useCases.getTrialBalance(req.params.organizationId, req.params.id);
            res.status(200).json(result);
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(404).json({ error: error.message });
            else res.status(500).json({ error: error.message });
        }
    }

    public async validateTrialBalance(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.useCases.validateTrialBalance(req.params.organizationId, req.params.id);
            res.status(200).json(result);
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(404).json({ error: error.message });
            else res.status(500).json({ error: error.message });
        }
    }

    public async compareTrialBalances(req: Request, res: Response): Promise<void> {
        try {
            const { id1, id2 } = req.body;
            if (!id1 || !id2) {
                 res.status(400).json({ error: 'id1 and id2 are required' });
                 return;
            }
            const result = await this.useCases.compareTrialBalances(req.params.organizationId, id1, id2);
            res.status(200).json(result);
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(400).json({ error: error.message });
            else res.status(500).json({ error: error.message });
        }
    }

    public async exportTrialBalance(req: Request, res: Response): Promise<void> {
        try {
            const { format } = req.query;
            if (format !== 'pdf' && format !== 'csv') {
                 res.status(400).json({ error: 'format must be pdf or csv' });
                 return;
            }
            const buffer = await this.useCases.exportTrialBalance(req.params.organizationId, req.params.id, format);
            
            if (format === 'csv') {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename="trial_balance_${req.params.id}.csv"`);
            } else {
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="trial_balance_${req.params.id}.pdf"`);
            }
            
            res.status(200).send(buffer);
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(400).json({ error: error.message });
            else res.status(500).json({ error: error.message });
        }
    }
}
