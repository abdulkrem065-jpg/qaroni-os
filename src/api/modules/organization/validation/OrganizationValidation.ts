import { Request, Response, NextFunction } from 'express';

export class OrganizationValidation {
    public static validateCreate(req: Request, res: Response, next: NextFunction): void {
        const { name } = req.body;
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            const error = new Error('Organization name is required and must be a string.');
            error.name = 'ValidationError';
            next(error);
            return;
        }
        next();
    }

    public static validateUpdateSettings(req: Request, res: Response, next: NextFunction): void {
        const { taxId, timezone, currency } = req.body;
        
        if (taxId !== undefined && typeof taxId !== 'string') {
            const error = new Error('taxId must be a string if provided.');
            error.name = 'ValidationError';
            next(error);
            return;
        }

        if (timezone !== undefined && typeof timezone !== 'string') {
            const error = new Error('timezone must be a string if provided.');
            error.name = 'ValidationError';
            next(error);
            return;
        }

        if (currency !== undefined && (typeof currency !== 'string' || currency.length !== 3)) {
            const error = new Error('currency must be a 3-character string if provided.');
            error.name = 'ValidationError';
            next(error);
            return;
        }

        next();
    }
}
