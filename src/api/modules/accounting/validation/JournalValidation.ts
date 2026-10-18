import { Request, Response, NextFunction } from 'express';

export class JournalValidation {
    public static validateCreateJournal(req: Request, res: Response, next: NextFunction): void {
        const { number, postingDate, accountingDate } = req.body;
        const errors = [];

        if (!number || typeof number !== 'string') errors.push('number is required and must be a string');
        if (!postingDate || typeof postingDate !== 'string') errors.push('postingDate is required and must be a valid date string');
        if (!accountingDate || typeof accountingDate !== 'string') errors.push('accountingDate is required and must be a valid date string');

        if (errors.length > 0) {
            res.status(400).json({ error: 'Validation failed', details: errors });
            return;
        }
        next();
    }

    public static validateUpdateJournal(req: Request, res: Response, next: NextFunction): void {
        const { postingDate, accountingDate } = req.body;
        const errors = [];

        if (!postingDate || typeof postingDate !== 'string') errors.push('postingDate is required and must be a valid date string');
        if (!accountingDate || typeof accountingDate !== 'string') errors.push('accountingDate is required and must be a valid date string');

        if (errors.length > 0) {
            res.status(400).json({ error: 'Validation failed', details: errors });
            return;
        }
        next();
    }

    public static validateJournalLine(req: Request, res: Response, next: NextFunction): void {
        const { accountId, debit, credit, currencyId } = req.body;
        const errors = [];

        if (!accountId || typeof accountId !== 'string') errors.push('accountId is required');
        if (typeof debit !== 'number') errors.push('debit must be a number');
        if (typeof credit !== 'number') errors.push('credit must be a number');
        if (!currencyId || typeof currencyId !== 'string') errors.push('currencyId is required');

        if (errors.length > 0) {
            res.status(400).json({ error: 'Validation failed', details: errors });
            return;
        }
        next();
    }
}
