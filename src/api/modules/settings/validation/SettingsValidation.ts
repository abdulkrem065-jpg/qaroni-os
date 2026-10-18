import { Request, Response, NextFunction } from 'express';

export class SettingsValidation {
    public static validateCreateCurrency(req: Request, res: Response, next: NextFunction): void {
        const { code, symbol } = req.body;
        const errors = [];
        if (!code || typeof code !== 'string' || code.length !== 3) errors.push('code must be a 3-character string');
        if (!symbol || typeof symbol !== 'string') errors.push('symbol is required');
        
        if (errors.length > 0) {
            res.status(400).json({ error: 'Validation failed', details: errors });
            return;
        }
        next();
    }

    public static validateUpdateCurrency(req: Request, res: Response, next: NextFunction): void {
        const { symbol } = req.body;
        if (!symbol || typeof symbol !== 'string') {
            res.status(400).json({ error: 'Validation failed', details: ['symbol is required'] });
            return;
        }
        next();
    }

    public static validateCreateExchangeRate(req: Request, res: Response, next: NextFunction): void {
        const { fromCurrencyId, toCurrencyId, rate, effectiveDate } = req.body;
        const errors = [];
        if (!fromCurrencyId) errors.push('fromCurrencyId is required');
        if (!toCurrencyId) errors.push('toCurrencyId is required');
        if (typeof rate !== 'number' || rate <= 0) errors.push('rate must be a positive number');
        if (!effectiveDate) errors.push('effectiveDate is required');

        if (errors.length > 0) {
            res.status(400).json({ error: 'Validation failed', details: errors });
            return;
        }
        next();
    }

    public static validateCreateFiscalYear(req: Request, res: Response, next: NextFunction): void {
        const { year, periods } = req.body;
        const errors = [];
        if (typeof year !== 'number') errors.push('year must be a number');
        if (!Array.isArray(periods) || periods.length === 0) errors.push('periods must be a non-empty array');

        if (errors.length > 0) {
            res.status(400).json({ error: 'Validation failed', details: errors });
            return;
        }
        next();
    }

    public static validateCreateTaxProfile(req: Request, res: Response, next: NextFunction): void {
        const { name, rate } = req.body;
        const errors = [];
        if (!name) errors.push('name is required');
        if (typeof rate !== 'number' || rate < 0) errors.push('rate must be a non-negative number');

        if (errors.length > 0) {
            res.status(400).json({ error: 'Validation failed', details: errors });
            return;
        }
        next();
    }
    
    public static validateUpdateTaxProfile(req: Request, res: Response, next: NextFunction): void {
        const { name, rate, isActive } = req.body;
        const errors = [];
        if (!name) errors.push('name is required');
        if (typeof rate !== 'number' || rate < 0) errors.push('rate must be a non-negative number');
        if (typeof isActive !== 'boolean') errors.push('isActive must be a boolean');

        if (errors.length > 0) {
            res.status(400).json({ error: 'Validation failed', details: errors });
            return;
        }
        next();
    }

    public static validateCreateNumberSequence(req: Request, res: Response, next: NextFunction): void {
        const { entityType, prefix, pattern } = req.body;
        const errors = [];
        if (!entityType) errors.push('entityType is required');

        if (errors.length > 0) {
            res.status(400).json({ error: 'Validation failed', details: errors });
            return;
        }
        next();
    }
}
