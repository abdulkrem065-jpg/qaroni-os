import { LedgerEntry } from '../aggregates/LedgerEntry';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export interface ILedgerEntryRepository {
    save(entry: LedgerEntry): Promise<void>;
    saveBulk(entries: LedgerEntry[]): Promise<void>;
}
