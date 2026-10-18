export interface BranchDto {
    id: string;
    organizationId: string;
    code: string;
    profile: {
        name: string;
        address: {
            street: string;
            city: string;
            state: string;
            country: string;
            postalCode: string;
        };
        phone?: string;
        email?: string;
    };
    settings: {
        type: string;
        operatingHours?: string;
        timezone?: string;
    };
    status: string;
}
