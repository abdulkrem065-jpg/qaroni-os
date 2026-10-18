import { FiscalCalendar } from '../aggregates/FiscalCalendar';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { FiscalYear } from '../valueobjects/FiscalYear';

export interface IFiscalRepository {
    save(calendar: FiscalCalendar): Promise<void>;
    findByYear(organizationId: OrganizationId, year: FiscalYear): Promise<FiscalCalendar | null>;
    findByOrganization(organizationId: OrganizationId): Promise<FiscalCalendar[]>;
}
