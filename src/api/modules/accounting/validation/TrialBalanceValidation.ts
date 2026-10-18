import { Request, Response, NextFunction } from 'express';

export class TrialBalanceValidation {
    public static validateGenerate(req: Request, res: Response, next: NextFunction): void {
        const { periodType, startDate, endDate } = req.body;
        const errors = [];

        if (!periodType) errors.push('periodType is required');
        if (!startDate) errors.push('startDate is required');
        if (!endDate) errors.push('endDate is required');

        if (errors.length > 0) {
            res.status(400).json({ error: 'Validation failed', details: errors });
            return;
        }
        next();
    }
}
