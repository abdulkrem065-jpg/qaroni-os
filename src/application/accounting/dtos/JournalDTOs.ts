export interface CreateJournalDTO {
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
