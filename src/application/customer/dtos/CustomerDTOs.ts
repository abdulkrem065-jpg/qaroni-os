export interface CreateCustomerDTO {
    organizationId: string;
    code: string;
    name: string;
    phone?: string;
    email?: string;
    address?: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    category?: string;
    creditLimit?: number;
}

export interface UpdateCustomerDTO {
    organizationId: string;
    customerId: string;
    name: string;
    phone?: string;
    email?: string;
    address?: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    category?: string;
}

export interface ChangeCreditLimitDTO {
    organizationId: string;
    customerId: string;
    creditLimit: number;
}

export interface CustomerResponseDTO {
    id: string;
    organizationId: string;
    code: string;
    name: string;
    phone?: string;
    email?: string;
    address?: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    status: string;
    category: string;
    creditLimit: number;
    createdAt: string;
    updatedAt: string;
}
