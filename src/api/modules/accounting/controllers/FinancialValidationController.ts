import { Request, Response } from 'express';
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
