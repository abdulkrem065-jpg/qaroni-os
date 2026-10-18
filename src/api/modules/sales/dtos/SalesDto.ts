import { PaymentMethod } from '../../../../domain/sales/types/SalesTypes';

export interface CreateOrderDto {
    branchId: string;
}

export interface AddItemDto {
    productId: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    tax?: number;
}

export interface UpdateItemDto {
    quantity: number;
    unitPrice: number;
    discount?: number;
    tax?: number;
}

export interface RegisterPaymentDto {
    amount: number;
    method: PaymentMethod;
}
