import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

# Controller
create_file('src/api/modules/accounting/controllers/TrialBalanceController.ts', """import { Request, Response } from 'express';
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
""")

create_file('src/api/modules/accounting/validation/TrialBalanceValidation.ts', """import { Request, Response, NextFunction } from 'express';

export class TrialBalanceValidation {
    public static validateGenerate(req: Request, res: Response, next: NextFunction): void {
        const { periodType, startDate, endDate } = req.body;
        const errors = [];

        if (!periodType) errors.push('periodType is required');
        if (!startDate) errors.push('startDate is required');
        if (!endDate) errors.push('endDate is required');

        if (errors.length > 0) {
            res.status(400).json({ error: 'Validation failed', details: errors });
            return;
        }
        next();
    }
}
""")

print("Trial Balance API generated")
