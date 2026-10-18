import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

# Controller
create_file('src/api/modules/accounting/controllers/IncomeStatementController.ts', """import { Request, Response } from 'express';
import { IncomeStatementUseCases } from '../../../../application/accounting/usecases/IncomeStatementUseCases';
import { BusinessRuleError } from '../../../../domain/shared/errors/BusinessRuleError';

export class IncomeStatementController {
    constructor(private readonly useCases: IncomeStatementUseCases) {
        this.generateIncomeStatement = this.generateIncomeStatement.bind(this);
        this.getIncomeStatement = this.getIncomeStatement.bind(this);
        this.validateIncomeStatement = this.validateIncomeStatement.bind(this);
        this.compareIncomeStatements = this.compareIncomeStatements.bind(this);
        this.exportIncomeStatement = this.exportIncomeStatement.bind(this);
    }

    public async generateIncomeStatement(req: Request, res: Response): Promise<void> {
        try {
            const dto = {
                organizationId: req.params.organizationId,
                ...req.body
            };
            const result = await this.useCases.generateIncomeStatement(dto);
            res.status(201).json(result);
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(400).json({ error: error.message });
            else res.status(500).json({ error: error.message });
        }
    }

    public async getIncomeStatement(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.useCases.getIncomeStatement(req.params.organizationId, req.params.id);
            res.status(200).json(result);
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(404).json({ error: error.message });
            else res.status(500).json({ error: error.message });
        }
    }

    public async validateIncomeStatement(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.useCases.validateIncomeStatement(req.params.organizationId, req.params.id);
            res.status(200).json(result);
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(404).json({ error: error.message });
            else res.status(500).json({ error: error.message });
        }
    }

    public async compareIncomeStatements(req: Request, res: Response): Promise<void> {
        try {
            const { id1, id2 } = req.body;
            if (!id1 || !id2) {
                 res.status(400).json({ error: 'id1 and id2 are required' });
                 return;
            }
            const result = await this.useCases.compareIncomeStatements(req.params.organizationId, id1, id2);
            res.status(200).json(result);
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(400).json({ error: error.message });
            else res.status(500).json({ error: error.message });
        }
    }

    public async exportIncomeStatement(req: Request, res: Response): Promise<void> {
        try {
            const { format } = req.query;
            if (format !== 'pdf' && format !== 'csv') {
                 res.status(400).json({ error: 'format must be pdf or csv' });
                 return;
            }
            const buffer = await this.useCases.exportIncomeStatement(req.params.organizationId, req.params.id, format);
            
            if (format === 'csv') {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename="income_statement_${req.params.id}.csv"`);
            } else {
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="income_statement_${req.params.id}.pdf"`);
            }
            
            res.status(200).send(buffer);
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(400).json({ error: error.message });
            else res.status(500).json({ error: error.message });
        }
    }
}
""")

create_file('src/api/modules/accounting/validation/IncomeStatementValidation.ts', """import { Request, Response, NextFunction } from 'express';

export class IncomeStatementValidation {
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

print("Income Statement API generated")
