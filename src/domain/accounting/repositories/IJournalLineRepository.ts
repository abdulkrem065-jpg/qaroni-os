import { JournalLine } from '../entities/JournalLine';
import { JournalId } from '../valueobjects/JournalId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export interface IJournalLineRepository {
    saveMany(journalId: JournalId, lines: JournalLine[]): Promise<void>;
    findByJournalId(journalId: JournalId): Promise<JournalLine[]>;
    deleteMany(journalId: JournalId): Promise<void>;
}
