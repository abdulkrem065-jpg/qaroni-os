export interface CreateAccountDTO {
    organizationId: string;
    code: string;
    name: string;
    type: string;
    category: string;
    normalBalance: string;
    isHeader: boolean;
    parentId?: string;
}

export interface UpdateAccountDTO {
    organizationId: string;
    accountId: string;
    name: string;
    category: string;
}

export interface MoveAccountDTO {
    organizationId: string;
    accountId: string;
    newParentId?: string;
}

export interface AccountResponseDTO {
    id: string;
    organizationId: string;
    code: string;
    name: string;
    type: string;
    category: string;
    normalBalance: string;
    status: string;
    isHeader: boolean;
    level: number;
    parentId?: string;
}
