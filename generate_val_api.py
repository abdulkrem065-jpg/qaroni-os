import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

# Controller
create_file('src/api/modules/accounting/controllers/FinancialValidationController.ts', """import { Request, Response } from 'express';
import { FinancialValidationUseCases } from '../../../../application/accounting/usecases/FinancialValidationUseCases';
import { BusinessRuleError } from '../../../../domain/shared/errors/BusinessRuleError';

export class FinancialValidationController {
    constructor(private readonly useCases: FinancialValidationUseCases) {
        this.executeValidation = this.executeValidation.bind(this);
        this.getValidationHistory = this.getValidationHistory.bind(this);
    }

    public async executeValidation(req: Request, res: Response): Promise<void> {
        try {
            const dto = {
                organizationId: req.params.organizationId,
                ...req.body
            };
            const result = await this.useCases.executeFinancialValidation(dto);
            res.status(201).json(result);
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(400).json({ error: error.message });
            else res.status(500).json({ error: error.message });
        }
    }

    public async getValidationHistory(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.useCases.getValidationHistory(req.params.organizationId);
            res.status(200).json(result);
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(404).json({ error: error.message });
            else res.status(500).json({ error: error.message });
        }
    }
}
""")

create_file('src/api/modules/accounting/validation/FinancialValidationRequestValidation.ts', """import { Request, Response, NextFunction } from 'express';

export class FinancialValidationRequestValidation {
    public static validateExecute(req: Request, res: Response, next: NextFunction): void {
        const { category } = req.body;
        const errors = [];

        if (!category) errors.push('category is required');

        if (errors.length > 0) {
            res.status(400).json({ error: 'Validation failed', details: errors });
            return;
        }
        next();
    }
}
""")

print("Financial Validation API generated")
