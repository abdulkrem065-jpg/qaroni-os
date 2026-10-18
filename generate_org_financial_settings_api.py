import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

# Controller
create_file('src/api/modules/settings/controllers/OrganizationFinancialSettingsController.ts', """import { Request, Response } from 'express';
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
""")

# Validation
create_file('src/api/modules/settings/validation/OrganizationFinancialSettingsValidation.ts', """import { Request, Response, NextFunction } from 'express';

export class OrganizationFinancialSettingsValidation {
    public static validateUpdateSettings(req: Request, res: Response, next: NextFunction): void {
        const { country, timeZone, decimalPrecision, financialYearStart, dateFormat, numberFormat } = req.body;
        const errors = [];
        
        if (!country) errors.push('country is required');
        if (!timeZone) errors.push('timeZone is required');
        if (typeof decimalPrecision !== 'number' || decimalPrecision < 0 || decimalPrecision > 6) {
            errors.push('decimalPrecision must be a number between 0 and 6');
        }
        if (typeof financialYearStart !== 'number' || financialYearStart < 1 || financialYearStart > 12) {
            errors.push('financialYearStart must be a number between 1 and 12');
        }
        if (!dateFormat) errors.push('dateFormat is required');
        if (!numberFormat) errors.push('numberFormat is required');
        
        if (errors.length > 0) {
            res.status(400).json({ error: 'Validation failed', details: errors });
            return;
        }
        next();
    }
}
""")

print("API generated")
