import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

# Controller
create_file('src/api/modules/accounting/controllers/BalanceSheetController.ts', """import { Request, Response } from 'express';
import { BalanceSheetUseCases } from '../../../../application/accounting/usecases/BalanceSheetUseCases';
import { BusinessRuleError } from '../../../../domain/shared/errors/BusinessRuleError';

export class BalanceSheetController {
    constructor(private readonly useCases: BalanceSheetUseCases) {
        this.generateBalanceSheet = this.generateBalanceSheet.bind(this);
        this.getBalanceSheet = this.getBalanceSheet.bind(this);
        this.validateBalanceSheet = this.validateBalanceSheet.bind(this);
        this.compareBalanceSheets = this.compareBalanceSheets.bind(this);
        this.exportBalanceSheet = this.exportBalanceSheet.bind(this);
    }

    public async generateBalanceSheet(req: Request, res: Response): Promise<void> {
        try {
            const dto = {
                organizationId: req.params.organizationId,
                ...req.body
            };
            const result = await this.useCases.generateBalanceSheet(dto);
            res.status(201).json(result);
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(400).json({ error: error.message });
            else res.status(500).json({ error: error.message });
        }
    }

    public async getBalanceSheet(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.useCases.getBalanceSheet(req.params.organizationId, req.params.id);
            res.status(200).json(result);
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(404).json({ error: error.message });
            else res.status(500).json({ error: error.message });
        }
    }

    public async validateBalanceSheet(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.useCases.validateBalanceSheet(req.params.organizationId, req.params.id);
            res.status(200).json(result);
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(404).json({ error: error.message });
            else res.status(500).json({ error: error.message });
        }
    }

    public async compareBalanceSheets(req: Request, res: Response): Promise<void> {
        try {
            const { id1, id2 } = req.body;
            if (!id1 || !id2) {
                 res.status(400).json({ error: 'id1 and id2 are required' });
                 return;
            }
            const result = await this.useCases.compareBalanceSheets(req.params.organizationId, id1, id2);
            res.status(200).json(result);
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(400).json({ error: error.message });
            else res.status(500).json({ error: error.message });
        }
    }

    public async exportBalanceSheet(req: Request, res: Response): Promise<void> {
        try {
            const { format } = req.query;
            if (format !== 'pdf' && format !== 'csv') {
                 res.status(400).json({ error: 'format must be pdf or csv' });
                 return;
            }
            const buffer = await this.useCases.exportBalanceSheet(req.params.organizationId, req.params.id, format);
            
            if (format === 'csv') {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename="balance_sheet_${req.params.id}.csv"`);
            } else {
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="balance_sheet_${req.params.id}.pdf"`);
            }
            
            res.status(200).send(buffer);
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(400).json({ error: error.message });
            else res.status(500).json({ error: error.message });
        }
    }
}
""")

create_file('src/api/modules/accounting/validation/BalanceSheetValidation.ts', """import { Request, Response, NextFunction } from 'express';

export class BalanceSheetValidation {
    public static validateGenerate(req: Request, res: Response, next: NextFunction): void {
        const { trialBalanceId } = req.body;
        const errors = [];

        if (!trialBalanceId) errors.push('trialBalanceId is required');

        if (errors.length > 0) {
            res.status(400).json({ error: 'Validation failed', details: errors });
            return;
        }
        next();
    }
}
""")

print("Balance Sheet API generated")
