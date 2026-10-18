import os

with open('src/application/accounting/usecases/PostingUseCases.ts', 'r') as f:
    content = f.read()

# Add imports
imports = """import { IPostingRepository } from '../../../domain/accounting/repositories/IPostingRepository';
import { IJournalRepository } from '../../../domain/accounting/repositories/IJournalRepository';
import { IFiscalYearRepository } from '../ports/IFiscalYearRepository';
import { AccountingCycleEngine } from '../../../domain/accounting/services/AccountingCycleEngine';
"""

content = content.replace("import { IPostingRepository } from '../../../domain/accounting/repositories/IPostingRepository';\nimport { IJournalRepository } from '../../../domain/accounting/repositories/IJournalRepository';", imports)

# Update constructor
old_ctor = """    constructor(
        private readonly postingRepo: IPostingRepository,
        private readonly journalRepo: IJournalRepository,
        private readonly eventBus: IEventBus
    ) {}"""

new_ctor = """    constructor(
        private readonly postingRepo: IPostingRepository,
        private readonly journalRepo: IJournalRepository,
        private readonly fiscalYearRepo: IFiscalYearRepository,
        private readonly eventBus: IEventBus
    ) {}"""

content = content.replace(old_ctor, new_ctor)

# Update executePosting validation
old_val = """                if (journal.status.value !== 'APPROVED') {
                    throw new BusinessRuleError(`Journal ${jIdStr} must be APPROVED to be posted.`);
                }"""

new_val = """                if (journal.status.value !== 'APPROVED') {
                    throw new BusinessRuleError(`Journal ${jIdStr} must be APPROVED to be posted.`);
                }

                const fiscalYear = await this.fiscalYearRepo.findByDate(orgId, journal.date);
                if (!fiscalYear) {
                    throw new BusinessRuleError(`No Fiscal Year found for journal date ${journal.date.toISOString()}`);
                }
                AccountingCycleEngine.validateJournalForPosting(journal, fiscalYear);
"""

content = content.replace(old_val, new_val)

with open('src/application/accounting/usecases/PostingUseCases.ts', 'w') as f:
    f.write(content)
