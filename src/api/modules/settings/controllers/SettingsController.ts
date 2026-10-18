import { Request, Response } from 'express';
import { SettingsUseCases } from '../../../../application/settings/usecases/SettingsUseCases';

export class SettingsController {
    constructor(private readonly useCases: SettingsUseCases) {
        this.createCurrency = this.createCurrency.bind(this);
        this.updateCurrency = this.updateCurrency.bind(this);
        this.changeBaseCurrency = this.changeBaseCurrency.bind(this);
        this.createExchangeRate = this.createExchangeRate.bind(this);
        this.createFiscalYear = this.createFiscalYear.bind(this);
        this.openFiscalPeriod = this.openFiscalPeriod.bind(this);
        this.closeFiscalPeriod = this.closeFiscalPeriod.bind(this);
        this.createTaxProfile = this.createTaxProfile.bind(this);
        this.updateTaxProfile = this.updateTaxProfile.bind(this);
        this.createNumberSequence = this.createNumberSequence.bind(this);
        this.generateNextNumber = this.generateNextNumber.bind(this);
    }

    public async createCurrency(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.useCases.createCurrency({ ...req.body, organizationId: req.params.organizationId });
            res.status(201).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    public async updateCurrency(req: Request, res: Response): Promise<void> {
        try {
            await this.useCases.updateCurrency({ ...req.body, organizationId: req.params.organizationId, currencyId: req.params.currencyId });
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    public async changeBaseCurrency(req: Request, res: Response): Promise<void> {
        try {
            await this.useCases.changeBaseCurrency(req.params.organizationId, req.params.currencyId);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    public async createExchangeRate(req: Request, res: Response): Promise<void> {
        try {
            await this.useCases.createExchangeRate({ ...req.body, organizationId: req.params.organizationId });
            res.status(201).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    public async createFiscalYear(req: Request, res: Response): Promise<void> {
        try {
            await this.useCases.createFiscalYear({ ...req.body, organizationId: req.params.organizationId });
            res.status(201).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    public async openFiscalPeriod(req: Request, res: Response): Promise<void> {
        try {
            await this.useCases.openFiscalPeriod(req.params.organizationId, Number(req.params.year), req.params.periodId);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    public async closeFiscalPeriod(req: Request, res: Response): Promise<void> {
        try {
            await this.useCases.closeFiscalPeriod(req.params.organizationId, Number(req.params.year), req.params.periodId);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    public async createTaxProfile(req: Request, res: Response): Promise<void> {
        try {
            await this.useCases.createTaxProfile({ ...req.body, organizationId: req.params.organizationId });
            res.status(201).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    public async updateTaxProfile(req: Request, res: Response): Promise<void> {
        try {
            await this.useCases.updateTaxProfile({ ...req.body, organizationId: req.params.organizationId, taxProfileId: req.params.taxProfileId });
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    public async createNumberSequence(req: Request, res: Response): Promise<void> {
        try {
            await this.useCases.createNumberSequence({ ...req.body, organizationId: req.params.organizationId });
            res.status(201).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    public async generateNextNumber(req: Request, res: Response): Promise<void> {
        try {
            const num = await this.useCases.generateNextNumber(req.params.organizationId, req.params.entityType);
            res.status(200).json({ number: num });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
