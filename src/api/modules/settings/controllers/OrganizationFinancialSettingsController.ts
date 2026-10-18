import { Request, Response } from 'express';
import { OrganizationFinancialSettingsUseCases } from '../../../../application/settings/usecases/OrganizationFinancialSettingsUseCases';

export class OrganizationFinancialSettingsController {
    constructor(private readonly useCases: OrganizationFinancialSettingsUseCases) {
        this.getSettings = this.getSettings.bind(this);
        this.updateSettings = this.updateSettings.bind(this);
    }

    public async getSettings(req: Request, res: Response): Promise<void> {
        try {
            const settings = await this.useCases.getSettings(req.params.organizationId);
            if (!settings) {
                res.status(404).json({ error: 'Settings not found' });
                return;
            }
            res.status(200).json(settings);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    public async updateSettings(req: Request, res: Response): Promise<void> {
        try {
            await this.useCases.updateSettings({ ...req.body, organizationId: req.params.organizationId });
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
