import { Request, Response, NextFunction } from 'express';

export class PostingValidation {
    public static validateExecutePosting(req: Request, res: Response, next: NextFunction): void {
        const { journalIds } = req.body;
        const errors = [];

        if (!journalIds || !Array.isArray(journalIds) || journalIds.length === 0) {
            errors.push('journalIds is required and must be a non-empty array of strings');
        } else {
            for (const id of journalIds) {
                if (typeof id !== 'string') {
                    errors.push('All journalIds must be strings');
                    break;
                }
            }
        }

        if (errors.length > 0) {
            res.status(400).json({ error: 'Validation failed', details: errors });
            return;
        }
        next();
    }
}
