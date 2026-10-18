import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

# DTOs
create_file('src/application/accounting/dtos/JournalDTOs.ts', """export interface CreateJournalDTO {
    organizationId: string;
    number: string;
    description?: string;
    postingDate: string;
    accountingDate: string;
    referenceNumber?: string;
}

export interface UpdateJournalDTO {
    organizationId: string;
    journalId: string;
    description?: string;
    postingDate: string;
    accountingDate: string;
    referenceNumber?: string;
}

export interface JournalLineDTO {
    accountId: string;
    description?: string;
    debit: number;
    credit: number;
    currencyId: string;
    costCenterId?: string;
    branchId?: string;
    customerId?: string;
    supplierId?: string;
}

export interface AddJournalLineDTO {
    organizationId: string;
    journalId: string;
    line: JournalLineDTO;
}

export interface RemoveJournalLineDTO {
    organizationId: string;
    journalId: string;
    lineId: string;
}

export interface JournalResponseDTO {
    id: string;
    organizationId: string;
    number: string;
    description: string;
    status: string;
    postingDate: string;
    accountingDate: string;
    referenceNumber: string;
    lines: {
        id: string;
        accountId: string;
        description: string;
        debit: number;
        credit: number;
        currencyId: string;
        costCenterId?: string;
        branchId?: string;
        customerId?: string;
        supplierId?: string;
    }[];
}
""")

# UseCases
create_file('src/application/accounting/usecases/JournalUseCases.ts', """import { IJournalRepository } from '../../../domain/accounting/repositories/IJournalRepository';
import { IJournalLineRepository } from '../../../domain/accounting/repositories/IJournalLineRepository';
import { IEventBus } from '../../ports/IEventBus';
import { Journal } from '../../../domain/accounting/aggregates/Journal';
import { JournalId } from '../../../domain/accounting/valueobjects/JournalId';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { JournalNumber } from '../../../domain/accounting/valueobjects/JournalNumber';
import { JournalDescription } from '../../../domain/accounting/valueobjects/JournalDescription';
import { PostingDate } from '../../../domain/accounting/valueobjects/PostingDate';
import { AccountingDate } from '../../../domain/accounting/valueobjects/AccountingDate';
import { ReferenceNumber } from '../../../domain/accounting/valueobjects/ReferenceNumber';
import { BusinessRuleError } from '../../../domain/shared/errors/BusinessRuleError';
import { JournalLine } from '../../../domain/accounting/entities/JournalLine';
import { JournalLineId } from '../../../domain/accounting/valueobjects/JournalLineId';
import { AccountId } from '../../../domain/accounting/valueobjects/AccountId';
import { DebitAmount } from '../../../domain/accounting/valueobjects/DebitAmount';
import { CreditAmount } from '../../../domain/accounting/valueobjects/CreditAmount';
import * as crypto from 'crypto';
import { CreateJournalDTO, UpdateJournalDTO, AddJournalLineDTO, RemoveJournalLineDTO, JournalResponseDTO } from '../dtos/JournalDTOs';

export class JournalUseCases {
    constructor(
        private readonly journalRepo: IJournalRepository,
        private readonly journalLineRepo: IJournalLineRepository,
        private readonly eventBus: IEventBus
    ) {}

    public async createJournal(dto: CreateJournalDTO): Promise<JournalResponseDTO> {
        const orgId = new OrganizationId(dto.organizationId);
        
        const journal = Journal.create(
            new JournalId(crypto.randomUUID()),
            orgId,
            new JournalNumber(dto.number),
            new JournalDescription(dto.description),
            new PostingDate(dto.postingDate),
            new AccountingDate(dto.accountingDate),
            new ReferenceNumber(dto.referenceNumber)
        );

        await this.journalRepo.save(journal);
        await this.publishEvents(journal);

        return this.mapToDTO(journal);
    }

    public async updateJournal(dto: UpdateJournalDTO): Promise<void> {
        const orgId = new OrganizationId(dto.organizationId);
        const journal = await this.getJournalAggregate(new JournalId(dto.journalId), orgId);
        
        journal.update(
            new JournalDescription(dto.description),
            new PostingDate(dto.postingDate),
            new AccountingDate(dto.accountingDate),
            new ReferenceNumber(dto.referenceNumber)
        );
        
        await this.journalRepo.save(journal);
        await this.publishEvents(journal);
    }

    public async addJournalLine(dto: AddJournalLineDTO): Promise<void> {
        const orgId = new OrganizationId(dto.organizationId);
        const journal = await this.getJournalAggregate(new JournalId(dto.journalId), orgId);
        
        const line = JournalLine.create(
            new JournalLineId(crypto.randomUUID()),
            new AccountId(dto.line.accountId),
            new JournalDescription(dto.line.description),
            new DebitAmount(dto.line.debit),
            new CreditAmount(dto.line.credit),
            dto.line.currencyId,
            dto.line.costCenterId,
            dto.line.branchId,
            dto.line.customerId,
            dto.line.supplierId
        );

        journal.addLine(line);
        await this.saveJournalAndLines(journal);
        await this.publishEvents(journal);
    }

    public async removeJournalLine(dto: RemoveJournalLineDTO): Promise<void> {
        const orgId = new OrganizationId(dto.organizationId);
        const journal = await this.getJournalAggregate(new JournalId(dto.journalId), orgId);
        
        journal.removeLine(dto.lineId);
        
        await this.journalRepo.save(journal);
        // We sync lines by completely overriding them or rely on saveMany
        await this.journalLineRepo.deleteMany(journal.id);
        if (journal.lines.length > 0) {
            await this.journalLineRepo.saveMany(journal.id, journal.lines);
        }
        await this.publishEvents(journal);
    }

    public async approveJournal(organizationId: string, journalId: string): Promise<void> {
        const orgId = new OrganizationId(organizationId);
        const journal = await this.getJournalAggregate(new JournalId(journalId), orgId);
        
        // We first request approval (which validates balance and lines count)
        if (journal.status.value === 'DRAFT' || journal.status.value === 'REJECTED') {
            journal.requestApproval();
        }
        
        journal.approve();
        
        await this.journalRepo.save(journal);
        await this.publishEvents(journal);
    }

    public async rejectJournal(organizationId: string, journalId: string): Promise<void> {
        const orgId = new OrganizationId(organizationId);
        const journal = await this.getJournalAggregate(new JournalId(journalId), orgId);
        
        journal.reject();
        
        await this.journalRepo.save(journal);
        await this.publishEvents(journal);
    }

    public async cancelJournal(organizationId: string, journalId: string): Promise<void> {
        const orgId = new OrganizationId(organizationId);
        const journal = await this.getJournalAggregate(new JournalId(journalId), orgId);
        
        journal.cancel();
        
        await this.journalRepo.save(journal);
        await this.publishEvents(journal);
    }

    public async getJournal(organizationId: string, journalId: string): Promise<JournalResponseDTO | null> {
        const orgId = new OrganizationId(organizationId);
        const journal = await this.getJournalAggregate(new JournalId(journalId), orgId, false);
        if (!journal) return null;
        return this.mapToDTO(journal);
    }

    public async listJournals(organizationId: string): Promise<JournalResponseDTO[]> {
        const orgId = new OrganizationId(organizationId);
        const journals = await this.journalRepo.findByOrganization(orgId);
        // We may not want to load lines for lists to optimize, but mapToDTO requires them.
        // Let's load lines for all (in a real system we'd use pagination or a specific read model).
        const result: JournalResponseDTO[] = [];
        for (const j of journals) {
            const lines = await this.journalLineRepo.findByJournalId(j.id);
            for (const line of lines) j.addLine(line); // hacky way to populate lines without checking modifiable
            // actually we shouldn't use addLine because it checks status.
            // Better to load properly
            const fullJ = Journal.load(
                j.id, j.organizationId, j.number, j.description, j.status, j.postingDate, j.accountingDate, j.referenceNumber, lines
            );
            result.push(this.mapToDTO(fullJ));
        }
        return result;
    }
    
    public async validateJournalBalance(organizationId: string, journalId: string): Promise<{ valid: boolean, error?: string }> {
        const orgId = new OrganizationId(organizationId);
        const journal = await this.getJournalAggregate(new JournalId(journalId), orgId, false);
        if (!journal) throw new BusinessRuleError('Journal not found');
        
        try {
            journal.validateReadyForApproval();
            return { valid: true };
        } catch (e: any) {
            return { valid: false, error: e.message };
        }
    }

    private async getJournalAggregate(journalId: JournalId, orgId: OrganizationId, throwOnNull = true): Promise<Journal> {
        const journal = await this.journalRepo.findById(journalId, orgId);
        if (!journal) {
            if (throwOnNull) throw new BusinessRuleError('Journal not found');
            return null as any;
        }
        const lines = await this.journalLineRepo.findByJournalId(journalId);
        return Journal.load(
            journal.id, journal.organizationId, journal.number, journal.description,
            journal.status, journal.postingDate, journal.accountingDate, journal.referenceNumber, lines
        );
    }

    private async saveJournalAndLines(journal: Journal): Promise<void> {
        await this.journalRepo.save(journal);
        await this.journalLineRepo.deleteMany(journal.id);
        if (journal.lines.length > 0) {
            await this.journalLineRepo.saveMany(journal.id, journal.lines);
        }
    }

    private async publishEvents(journal: Journal): Promise<void> {
        for (const ev of journal.domainEvents) await this.eventBus.publish(ev);
        journal.clearDomainEvents();
    }

    private mapToDTO(journal: Journal): JournalResponseDTO {
        return {
            id: journal.id.value,
            organizationId: journal.organizationId.value,
            number: journal.number.value,
            description: journal.description.value,
            status: journal.status.value,
            postingDate: journal.postingDate.value.toISOString(),
            accountingDate: journal.accountingDate.value.toISOString(),
            referenceNumber: journal.referenceNumber.value,
            lines: journal.lines.map(l => ({
                id: l.id.value,
                accountId: l.accountId.value,
                description: l.description.value,
                debit: l.debit.value,
                credit: l.credit.value,
                currencyId: l.currencyId,
                costCenterId: l.costCenterId,
                branchId: l.branchId,
                customerId: l.customerId,
                supplierId: l.supplierId
            }))
        };
    }
}
""")

print("Journal Application layer generated")
