import { Request, Response, NextFunction } from 'express';

export class AccountValidation {
    public static validateCreateAccount(req: Request, res: Response, next: NextFunction): void {
        const { code, name, type, category, normalBalance, isHeader } = req.body;
        const errors = [];

        if (!code || typeof code !== 'string') errors.push('code is required and must be a string');
        if (!name || typeof name !== 'string') errors.push('name is required and must be a string');
        if (!['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'].includes(type)) errors.push('invalid type');
        if (!category || typeof category !== 'string') errors.push('category is required');
        if (!['DEBIT', 'CREDIT'].includes(normalBalance)) errors.push('normalBalance must be DEBIT or CREDIT');
        if (typeof isHeader !== 'boolean') errors.push('isHeader must be a boolean');

        if (errors.length > 0) {
            res.status(400).json({ error: 'Validation failed', details: errors });
            return;
        }
        next();
    }

    public static validateUpdateAccount(req: Request, res: Response, next: NextFunction): void {
        const { name, category } = req.body;
        const errors = [];

        if (!name || typeof name !== 'string') errors.push('name is required and must be a string');
        if (!category || typeof category !== 'string') errors.push('category is required');

        if (errors.length > 0) {
            res.status(400).json({ error: 'Validation failed', details: errors });
            return;
        }
        next();
    }

    public static validateMoveAccount(req: Request, res: Response, next: NextFunction): void {
        const { newParentId } = req.body;
        
        if (newParentId !== undefined && typeof newParentId !== 'string' && newParentId !== null) {
            res.status(400).json({ error: 'Validation failed', details: ['newParentId must be a string or null'] });
            return;
        }
        
        next();
    }
}
