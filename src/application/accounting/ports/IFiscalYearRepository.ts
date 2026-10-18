import { FiscalYear } from '../../../domain/accounting/aggregates/FiscalYear';
import { FiscalYearId } from '../../../domain/accounting/valueobjects/FiscalYearId';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';

export interface IFiscalYearRepository {
    save(fiscalYear: FiscalYear): Promise<void>;
    findById(organizationId: OrganizationId, id: FiscalYearId): Promise<FiscalYear | null>;
    findByYear(organizationId: OrganizationId, year: number): Promise<FiscalYear | null>;
    findAll(organizationId: OrganizationId): Promise<FiscalYear[]>;
    findByDate(organizationId: OrganizationId, date: Date): Promise<FiscalYear | null>;
}
