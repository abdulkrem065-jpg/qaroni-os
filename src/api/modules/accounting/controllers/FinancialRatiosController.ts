import { Request, Response } from 'express';
import { FinancialRatiosUseCases } from '../../../../application/accounting/usecases/FinancialRatiosUseCases';
import { BusinessRuleError } from '../../../../domain/shared/errors/BusinessRuleError';

export class FinancialRatiosController {
    constructor(private readonly useCases: FinancialRatiosUseCases) {
        this.generateRatios = this.generateRatios.bind(this);
        this.getRatios = this.getRatios.bind(this);
        this.validateRatios = this.validateRatios.bind(this);
        this.compareRatios = this.compareRatios.bind(this);
    }

    public async generateRatios(req: Request, res: Response): Promise<void> {
        try {
            const dto = {
                organizationId: req.params.organizationId,
                ...req.body
            };
            const result = await this.useCases.generateFinancialRatios(dto);
            res.status(201).json(result);
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(400).json({ error: error.message });
            else res.status(500).json({ error: error.message });
        }
    }

    public async getRatios(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.useCases.getFinancialRatios(req.params.organizationId, req.params.id);
            res.status(200).json(result);
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(404).json({ error: error.message });
            else res.status(500).json({ error: error.message });
        }
    }

    public async validateRatios(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.useCases.validateFinancialRatios(req.params.organizationId, req.params.id);
            res.status(200).json(result);
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(404).json({ error: error.message });
            else res.status(500).json({ error: error.message });
        }
    }

    public async compareRatios(req: Request, res: Response): Promise<void> {
        try {
            const { id1, id2 } = req.body;
            if (!id1 || !id2) {
                 res.status(400).json({ error: 'id1 and id2 are required' });
                 return;
            }
            const result = await this.useCases.compareFinancialRatios(req.params.organizationId, id1, id2);
            res.status(200).json(result);
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(400).json({ error: error.message });
            else res.status(500).json({ error: error.message });
        }
    }
}
