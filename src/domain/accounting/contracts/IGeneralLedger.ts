import { PostingBatchId } from '../valueobjects/PostingBatchId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export interface IGeneralLedger {
    recordPostingBatch(organizationId: OrganizationId, batchId: PostingBatchId): Promise<void>;
}
