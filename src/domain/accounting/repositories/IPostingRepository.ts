import { PostingBatch } from '../aggregates/PostingBatch';
import { PostingBatchId } from '../valueobjects/PostingBatchId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { JournalId } from '../valueobjects/JournalId';

export interface IPostingRepository {
    save(batch: PostingBatch): Promise<void>;
    findById(id: PostingBatchId, organizationId: OrganizationId): Promise<PostingBatch | null>;
    findByOrganization(organizationId: OrganizationId): Promise<PostingBatch[]>;
    findByJournalId(journalId: JournalId, organizationId: OrganizationId): Promise<PostingBatch[]>;
}
