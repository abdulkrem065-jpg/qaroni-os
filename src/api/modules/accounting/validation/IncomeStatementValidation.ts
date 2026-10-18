import { Request, Response, NextFunction } from 'express';

export class IncomeStatementValidation {
    public static validateGenerate(req: Request, res: Response, next: NextFunction): void {
        const { trialBalanceId } = req.body;
        const errors = [];

        if (!trialBalanceId) errors.push('trialBalanceId is required');

        if (errors.length > 0) {
            res.status(400).json({ error: 'Validation failed', details: errors });
            return;
        }
        next();
    }
}
