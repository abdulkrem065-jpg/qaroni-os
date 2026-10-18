import { Supplier } from '../aggregates/Supplier';
import { SupplierId } from '../../shared/valueobjects/SupplierId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export interface ISupplierRepository {
    save(supplier: Supplier): Promise<void>;
    findByIdAndOrganizationId(id: SupplierId, organizationId: OrganizationId): Promise<Supplier | null>;
    findAllByOrganizationId(organizationId: OrganizationId): Promise<Supplier[]>;
    findByCodeAndOrganizationId(code: string, organizationId: OrganizationId): Promise<Supplier | null>;
    findByTaxNumber(taxNumber: string): Promise<Supplier | null>;
}
