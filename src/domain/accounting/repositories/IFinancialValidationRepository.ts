import { FinancialValidation } from '../aggregates/FinancialValidation';
import { ValidationId } from '../valueobjects/ValidationId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export interface IFinancialValidationRepository {
    save(validation: FinancialValidation): Promise<void>;
    findById(id: ValidationId, organizationId: OrganizationId): Promise<FinancialValidation | null>;
    findByOrganization(organizationId: OrganizationId): Promise<FinancialValidation[]>;
}
