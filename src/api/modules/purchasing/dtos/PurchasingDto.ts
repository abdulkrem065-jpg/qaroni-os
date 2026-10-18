export interface CreatePurchaseOrderDto {
    branchId: string;
    supplierId: string;
}

export interface PurchaseItemDto {
    productId: string;
    quantity: number;
    unitPrice: number;
}

export interface ReceiveGoodsDto {
    items: {
        productId: string;
        quantity: number;
    }[];
}

export interface RegisterPurchasePaymentDto {
    amount: number;
}
