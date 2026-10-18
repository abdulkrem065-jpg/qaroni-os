export interface UpdateBranchRequest {
    address?: {
        street: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
    };
    isActive?: boolean;
}
