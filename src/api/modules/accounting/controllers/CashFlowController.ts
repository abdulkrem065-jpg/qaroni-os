import { Request, Response } from 'express';
import { CashFlowUseCases } from '../../../../application/accounting/usecases/CashFlowUseCases';
import { BusinessRuleError } from '../../../../domain/shared/errors/BusinessRuleError';

export class CashFlowController {
    constructor(private readonly useCases: CashFlowUseCases) {
        this.generateCashFlow = this.generateCashFlow.bind(this);
        this.getCashFlow = this.getCashFlow.bind(this);
        this.validateCashFlow = this.validateCashFlow.bind(this);
        this.compareCashFlows = this.compareCashFlows.bind(this);
        this.exportCashFlow = this.exportCashFlow.bind(this);
    }

    public async generateCashFlow(req: Request, res: Response): Promise<void> {
        try {
            const dto = {
                organizationId: req.params.organizationId,
                ...req.body
            };
            const result = await this.useCases.generateCashFlow(dto);
            res.status(201).json(result);
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(400).json({ error: error.message });
            else res.status(500).json({ error: error.message });
        }
    }

    public async getCashFlow(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.useCases.getCashFlow(req.params.organizationId, req.params.id);
            res.status(200).json(result);
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(404).json({ error: error.message });
            else res.status(500).json({ error: error.message });
        }
    }

    public async validateCashFlow(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.useCases.validateCashFlow(req.params.organizationId, req.params.id);
            res.status(200).json(result);
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(404).json({ error: error.message });
            else res.status(500).json({ error: error.message });
        }
    }

    public async compareCashFlows(req: Request, res: Response): Promise<void> {
        try {
            const { id1, id2 } = req.body;
            if (!id1 || !id2) {
                 res.status(400).json({ error: 'id1 and id2 are required' });
                 return;
            }
            const result = await this.useCases.compareCashFlows(req.params.organizationId, id1, id2);
            res.status(200).json(result);
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(400).json({ error: error.message });
            else res.status(500).json({ error: error.message });
        }
    }

    public async exportCashFlow(req: Request, res: Response): Promise<void> {
        try {
            const { format } = req.query;
            if (format !== 'pdf' && format !== 'csv') {
                 res.status(400).json({ error: 'format must be pdf or csv' });
                 return;
            }
            const buffer = await this.useCases.exportCashFlow(req.params.organizationId, req.params.id, format);
            
            if (format === 'csv') {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename="cash_flow_${req.params.id}.csv"`);
            } else {
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="cash_flow_${req.params.id}.pdf"`);
            }
            
            res.status(200).send(buffer);
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(400).json({ error: error.message });
            else res.status(500).json({ error: error.message });
        }
    }
}
