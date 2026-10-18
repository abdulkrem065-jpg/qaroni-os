import { Request, Response, NextFunction } from 'express';

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
