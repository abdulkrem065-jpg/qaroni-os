import { Request, Response } from 'express';
import { JournalUseCases } from '../../../../application/accounting/usecases/JournalUseCases';
import { BusinessRuleError } from '../../../../domain/shared/errors/BusinessRuleError';

export class JournalController {
    constructor(private readonly useCases: JournalUseCases) {
        this.createJournal = this.createJournal.bind(this);
        this.updateJournal = this.updateJournal.bind(this);
        this.addJournalLine = this.addJournalLine.bind(this);
        this.removeJournalLine = this.removeJournalLine.bind(this);
        this.approveJournal = this.approveJournal.bind(this);
        this.rejectJournal = this.rejectJournal.bind(this);
        this.cancelJournal = this.cancelJournal.bind(this);
        this.getJournal = this.getJournal.bind(this);
        this.listJournals = this.listJournals.bind(this);
        this.validateJournalBalance = this.validateJournalBalance.bind(this);
    }

    public async createJournal(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.useCases.createJournal({
                organizationId: req.params.organizationId,
                ...req.body
            });
            res.status(201).json(result);
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(400).json({ error: error.message });
            else res.status(500).json({ error: 'Internal server error' });
        }
    }

    public async updateJournal(req: Request, res: Response): Promise<void> {
        try {
            await this.useCases.updateJournal({
                organizationId: req.params.organizationId,
                journalId: req.params.journalId,
                ...req.body
            });
            res.status(204).send();
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(400).json({ error: error.message });
            else res.status(500).json({ error: 'Internal server error' });
        }
    }

    public async addJournalLine(req: Request, res: Response): Promise<void> {
        try {
            await this.useCases.addJournalLine({
                organizationId: req.params.organizationId,
                journalId: req.params.journalId,
                line: req.body
            });
            res.status(204).send();
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(400).json({ error: error.message });
            else res.status(500).json({ error: 'Internal server error' });
        }
    }

    public async removeJournalLine(req: Request, res: Response): Promise<void> {
        try {
            await this.useCases.removeJournalLine({
                organizationId: req.params.organizationId,
                journalId: req.params.journalId,
                lineId: req.params.lineId
            });
            res.status(204).send();
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(400).json({ error: error.message });
            else res.status(500).json({ error: 'Internal server error' });
        }
    }

    public async approveJournal(req: Request, res: Response): Promise<void> {
        try {
            await this.useCases.approveJournal(req.params.organizationId, req.params.journalId);
            res.status(204).send();
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(400).json({ error: error.message });
            else res.status(500).json({ error: 'Internal server error' });
        }
    }

    public async rejectJournal(req: Request, res: Response): Promise<void> {
        try {
            await this.useCases.rejectJournal(req.params.organizationId, req.params.journalId);
            res.status(204).send();
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(400).json({ error: error.message });
            else res.status(500).json({ error: 'Internal server error' });
        }
    }

    public async cancelJournal(req: Request, res: Response): Promise<void> {
        try {
            await this.useCases.cancelJournal(req.params.organizationId, req.params.journalId);
            res.status(204).send();
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(400).json({ error: error.message });
            else res.status(500).json({ error: 'Internal server error' });
        }
    }

    public async getJournal(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.useCases.getJournal(req.params.organizationId, req.params.journalId);
            if (!result) res.status(404).json({ error: 'Journal not found' });
            else res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    public async listJournals(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.useCases.listJournals(req.params.organizationId);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    public async validateJournalBalance(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.useCases.validateJournalBalance(req.params.organizationId, req.params.journalId);
            res.status(200).json(result);
        } catch (error: any) {
            if (error instanceof BusinessRuleError) res.status(400).json({ error: error.message });
            else res.status(500).json({ error: 'Internal server error' });
        }
    }
}
