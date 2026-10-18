export interface ReceiveStockDto {
    productId: string;
    amount: number;
    notes?: string;
}

export interface IssueStockDto {
    productId: string;
    amount: number;
    notes?: string;
}

export interface TransferStockDto {
    productId: string;
    amount: number;
    targetBranchId: string;
    notes?: string;
}

export interface AdjustStockDto {
    productId: string;
    newAmount: number;
    notes?: string;
}
