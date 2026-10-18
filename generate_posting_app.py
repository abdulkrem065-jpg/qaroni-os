import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

# Repositories
create_file('src/domain/accounting/repositories/IPostingRepository.ts', """import { PostingBatch } from '../aggregates/PostingBatch';
import { PostingBatchId } from '../valueobjects/PostingBatchId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { JournalId } from '../valueobjects/JournalId';

export interface IPostingRepository {
    save(batch: PostingBatch): Promise<void>;
    findById(id: PostingBatchId, organizationId: OrganizationId): Promise<PostingBatch | null>;
    findByOrganization(organizationId: OrganizationId): Promise<PostingBatch[]>;
    findByJournalId(journalId: JournalId, organizationId: OrganizationId): Promise<PostingBatch[]>;
}
""")

# DTOs
create_file('src/application/accounting/dtos/PostingDTOs.ts', """export interface ExecutePostingDTO {
    organizationId: string;
    journalIds: string[];
}

export interface PostingBatchDTO {
    id: string;
    organizationId: string;
    number: string;
    status: string;
    timestamp: string;
    transactions: {
        id: string;
        journalId: string;
        timestamp: string;
        isSuccess: boolean | null;
        errorDetails: string | null;
    }[];
}
""")

# Use Cases
create_file('src/application/accounting/usecases/PostingUseCases.ts', """import { IPostingRepository } from '../../../domain/accounting/repositories/IPostingRepository';
import { IJournalRepository } from '../../../domain/accounting/repositories/IJournalRepository';
import { IEventBus } from '../../ports/IEventBus';
import { PostingBatch } from '../../../domain/accounting/aggregates/PostingBatch';
import { PostingBatchId } from '../../../domain/accounting/valueobjects/PostingBatchId';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { PostingNumber } from '../../../domain/accounting/valueobjects/PostingNumber';
import { JournalId } from '../../../domain/accounting/valueobjects/JournalId';
import { BusinessRuleError } from '../../../domain/shared/errors/BusinessRuleError';
import * as crypto from 'crypto';
import { ExecutePostingDTO, PostingBatchDTO } from '../dtos/PostingDTOs';

export class PostingUseCases {
    constructor(
        private readonly postingRepo: IPostingRepository,
        private readonly journalRepo: IJournalRepository,
        private readonly eventBus: IEventBus
    ) {}

    public async executePosting(dto: ExecutePostingDTO): Promise<PostingBatchDTO> {
        const orgId = new OrganizationId(dto.organizationId);
        
        // 1. Create Batch
        const batchNumber = `PB-${Date.now()}`;
        const batch = PostingBatch.create(new PostingBatchId(crypto.randomUUID()), orgId, new PostingNumber(batchNumber));
        await this.postingRepo.save(batch); // Save initial state (POSTING_REQUESTED)

        try {
            // 2. Validate and Execute
            for (const jIdStr of dto.journalIds) {
                const jId = new JournalId(jIdStr);
                
                // Idempotency: Check if already posted successfully
                const existingBatches = await this.postingRepo.findByJournalId(jId, orgId);
                const alreadyPosted = existingBatches.some(b => 
                    (b.status.value === 'POSTED' || b.status.value === 'LOCKED') &&
                    b.transactions.some(tx => tx.journalId.value === jId.value && tx.result?.isSuccess)
                );
                
                if (alreadyPosted) {
                    throw new BusinessRuleError(`Journal ${jIdStr} is already posted.`);
                }

                const journal = await this.journalRepo.findById(jId, orgId);
                if (!journal) {
                    throw new BusinessRuleError(`Journal ${jIdStr} not found.`);
                }

                if (journal.status.value !== 'APPROVED') {
                    throw new BusinessRuleError(`Journal ${jIdStr} must be APPROVED to be posted.`);
                }

                // Add to batch and mark running
                batch.startPosting(jId, crypto.randomUUID());
                
                // Complete transaction (simulate execution, in real world this might involve moving data to ledger, but we are isolated)
                batch.completeTransaction(jId);

                // Update Journal status
                journal.markAsPosted();
                await this.journalRepo.save(journal);
            }

            // 3. Complete Batch
            batch.completeBatch();
            await this.postingRepo.save(batch);
            await this.publishEvents(batch);

            return this.mapToDTO(batch);

        } catch (error: any) {
            // 4. Failure Path
            batch.failBatch(error.message);
            await this.postingRepo.save(batch);
            
            // Rollback
            batch.rollbackBatch();
            await this.postingRepo.save(batch);
            await this.publishEvents(batch);
            
            throw error; // Re-throw to inform caller
        }
    }

    public async validatePosting(organizationId: string, journalIds: string[]): Promise<{ valid: boolean, errors: string[] }> {
        const orgId = new OrganizationId(organizationId);
        const errors: string[] = [];

        for (const jIdStr of journalIds) {
            const jId = new JournalId(jIdStr);
            const existingBatches = await this.postingRepo.findByJournalId(jId, orgId);
            const alreadyPosted = existingBatches.some(b => 
                (b.status.value === 'POSTED' || b.status.value === 'LOCKED') &&
                b.transactions.some(tx => tx.journalId.value === jId.value && tx.result?.isSuccess)
            );
            
            if (alreadyPosted) errors.push(`Journal ${jIdStr} is already posted.`);
            
            const journal = await this.journalRepo.findById(jId, orgId);
            if (!journal) errors.push(`Journal ${jIdStr} not found.`);
            else if (journal.status.value !== 'APPROVED') errors.push(`Journal ${jIdStr} is not APPROVED.`);
        }

        return { valid: errors.length === 0, errors };
    }

    public async getPostingHistory(organizationId: string): Promise<PostingBatchDTO[]> {
        const orgId = new OrganizationId(organizationId);
        const batches = await this.postingRepo.findByOrganization(orgId);
        return batches.map(b => this.mapToDTO(b));
    }

    public async lockPosting(organizationId: string, batchId: string): Promise<void> {
        const orgId = new OrganizationId(organizationId);
        const batch = await this.postingRepo.findById(new PostingBatchId(batchId), orgId);
        if (!batch) throw new BusinessRuleError('Posting batch not found');
        
        batch.lockBatch();
        await this.postingRepo.save(batch);
        await this.publishEvents(batch);
    }

    private async publishEvents(batch: PostingBatch): Promise<void> {
        for (const ev of batch.domainEvents) await this.eventBus.publish(ev);
        batch.clearDomainEvents();
    }

    private mapToDTO(batch: PostingBatch): PostingBatchDTO {
        return {
            id: batch.id.value,
            organizationId: batch.organizationId.value,
            number: batch.number.value,
            status: batch.status.value,
            timestamp: batch.timestamp.value.toISOString(),
            transactions: batch.transactions.map(tx => ({
                id: tx.id.value,
                journalId: tx.journalId.value,
                timestamp: tx.timestamp.value.toISOString(),
                isSuccess: tx.result ? tx.result.isSuccess : null,
                errorDetails: tx.result ? tx.result.errorDetails : null
            }))
        };
    }
}
""")

print("Posting Repositories and Use Cases generated")
