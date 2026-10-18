import { Request, Response, NextFunction } from 'express';

export class FinancialValidationRequestValidation {
    public static validateExecute(req: Request, res: Response, next: NextFunction): void {
        const { category } = req.body;
        const errors = [];

        if (!category) errors.push('category is required');

        if (errors.length > 0) {
            res.status(400).json({ error: 'Validation failed', details: errors });
            return;
        }
        next();
    }
}
