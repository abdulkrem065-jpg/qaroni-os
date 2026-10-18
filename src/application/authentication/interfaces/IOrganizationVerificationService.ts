export interface IOrganizationVerificationService {
    isOrganizationActive(organizationId: string): Promise<boolean>;
}
