export interface OrganizationDto {
    id: string;
    name: string;
    isActive: boolean;
    taxId?: string;
    timezone?: string;
    currency?: string;
}
