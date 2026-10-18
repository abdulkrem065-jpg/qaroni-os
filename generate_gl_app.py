import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

# Repositories
create_file('src/domain/accounting/repositories/ILedgerEntryRepository.ts', """import { LedgerEntry } from '../aggregates/LedgerEntry';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export interface ILedgerEntryRepository {
    save(entry: LedgerEntry): Promise<void>;
    saveBulk(entries: LedgerEntry[]): Promise<void>;
}
""")

create_file('src/domain/accounting/repositories/ILedgerBalanceRepository.ts', """import { LedgerBalance } from '../aggregates/LedgerBalance';
import { LedgerBalanceId } from '../valueobjects/LedgerBalanceId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { AccountId } from '../valueobjects/AccountId';
import { LedgerPeriod } from '../valueobjects/LedgerPeriod';

export interface ILedgerBalanceRepository {
    save(balance: LedgerBalance): Promise<void>;
    findByAccountAndPeriod(organizationId: OrganizationId, accountId: AccountId, period: LedgerPeriod): Promise<LedgerBalance | null>;
}
""")

# Application
create_file('src/application/accounting/usecases/GeneralLedgerUseCases.ts', """import { IGeneralLedger } from '../../../domain/accounting/contracts/IGeneralLedger';
import { ILedgerEntryRepository } from '../../../domain/accounting/repositories/ILedgerEntryRepository';
import { ILedgerBalanceRepository } from '../../../domain/accounting/repositories/ILedgerBalanceRepository';
import { IPostingRepository } from '../../../domain/accounting/repositories/IPostingRepository';
import { IJournalRepository } from '../../../domain/accounting/repositories/IJournalRepository';
import { IJournalLineRepository } from '../../../domain/accounting/repositories/IJournalLineRepository';
import { IEventBus } from '../../ports/IEventBus';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { PostingBatchId } from '../../../domain/accounting/valueobjects/PostingBatchId';
import { LedgerEntry } from '../../../domain/accounting/aggregates/LedgerEntry';
import { LedgerEntryId } from '../../../domain/accounting/valueobjects/LedgerEntryId';
import { LedgerBalance } from '../../../domain/accounting/aggregates/LedgerBalance';
import { LedgerBalanceId } from '../../../domain/accounting/valueobjects/LedgerBalanceId';
import { LedgerPeriod } from '../../../domain/accounting/valueobjects/LedgerPeriod';
import { BusinessRuleError } from '../../../domain/shared/errors/BusinessRuleError';
import * as crypto from 'crypto';
import { AccountId } from '../../../domain/accounting/valueobjects/AccountId';

export class GeneralLedgerUseCases implements IGeneralLedger {
    constructor(
        private readonly entryRepo: ILedgerEntryRepository,
        private readonly balanceRepo: ILedgerBalanceRepository,
        private readonly postingRepo: IPostingRepository,
        private readonly journalRepo: IJournalRepository,
        private readonly journalLineRepo: IJournalLineRepository,
        private readonly eventBus: IEventBus
    ) {}

    public async recordPostingBatch(organizationId: OrganizationId, batchId: PostingBatchId): Promise<void> {
        // Fetch batch
        const batch = await this.postingRepo.findById(batchId, organizationId);
        if (!batch) {
            throw new BusinessRuleError('Posting batch not found');
        }

        // Only process batches that are successfully POSTED or LOCKED
        if (batch.status.value !== 'POSTED' && batch.status.value !== 'LOCKED') {
            throw new BusinessRuleError('Can only record batches in POSTED or LOCKED state');
        }

        const entries: LedgerEntry[] = [];
        const balancesToUpdate: Record<string, LedgerBalance> = {}; // key: "accountId-period"

        for (const tx of batch.transactions) {
            if (!tx.result || !tx.result.isSuccess) continue; // Skip failed txs, though a POSTED batch shouldn't have them

            // Fetch journal and lines
            const journal = await this.journalRepo.findById(tx.journalId, organizationId);
            if (!journal) continue;

            const lines = await this.journalLineRepo.findByJournalId(tx.journalId, organizationId);
            
            const dateStr = journal.accountingDate.value.toISOString();
            const periodStr = dateStr.substring(0, 7); // YYYY-MM
            const period = new LedgerPeriod(periodStr);

            for (const line of lines) {
                // 1. Create Ledger Entry
                const entryId = new LedgerEntryId(crypto.randomUUID());
                const entry = LedgerEntry.create(
                    entryId,
                    organizationId,
                    line.accountId,
                    batchId,
                    tx.journalId,
                    line.id,
                    journal.accountingDate.value,
                    line.debit,
                    line.credit,
                    'USD' // Hardcoded for now
                );
                entries.push(entry);

                // 2. Update Balance
                const balanceKey = `${line.accountId.value}-${period.value}`;
                if (!balancesToUpdate[balanceKey]) {
                    let balance = await this.balanceRepo.findByAccountAndPeriod(organizationId, line.accountId, period);
                    if (!balance) {
                        balance = LedgerBalance.create(
                            new LedgerBalanceId(crypto.randomUUID()),
                            organizationId,
                            line.accountId,
                            period,
                            'USD'
                        );
                    }
                    balancesToUpdate[balanceKey] = balance;
                }

                balancesToUpdate[balanceKey].addTransaction(line.debit.value, line.credit.value);
            }
        }

        // Save everything
        if (entries.length > 0) {
            await this.entryRepo.saveBulk(entries);
        }

        const updatedBalances = Object.values(balancesToUpdate);
        for (const balance of updatedBalances) {
            await this.balanceRepo.save(balance);
            for (const ev of balance.domainEvents) await this.eventBus.publish(ev);
            balance.clearDomainEvents();
        }

        for (const entry of entries) {
            for (const ev of entry.domainEvents) await this.eventBus.publish(ev);
            entry.clearDomainEvents();
        }
    }
}
""")

print("General Ledger Application logic created")
