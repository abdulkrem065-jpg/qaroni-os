import os

with open('src/application/accounting/usecases/PostingUseCases.ts', 'r') as f:
    content = f.read()

retry_usecase = """
    public async retryFailedPosting(organizationId: string, batchId: string): Promise<PostingBatchDTO> {
        const orgId = new OrganizationId(organizationId);
        const batch = await this.postingRepo.findById(new PostingBatchId(batchId), orgId);
        if (!batch) throw new BusinessRuleError('Posting batch not found');
        
        if (batch.status.value !== 'ROLLED_BACK' && batch.status.value !== 'FAILED') {
            throw new BusinessRuleError('Only failed/rolled back batches can be retried');
        }

        const journalIds = batch.transactions.map(tx => tx.journalId.value);
        // Create a new execution
        return this.executePosting({ organizationId, journalIds });
    }
"""

content = content.replace("public async getPostingHistory", retry_usecase + "\n    public async getPostingHistory")

with open('src/application/accounting/usecases/PostingUseCases.ts', 'w') as f:
    f.write(content)

print("Added retryFailedPosting to Use Cases")
