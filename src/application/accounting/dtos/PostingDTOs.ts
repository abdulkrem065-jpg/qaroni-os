export interface ExecutePostingDTO {
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
