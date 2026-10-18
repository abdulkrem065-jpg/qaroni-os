import { SupabaseClient } from '@supabase/supabase-js';
import { IFiscalRepository } from '../../../domain/settings/repositories/IFiscalRepository';
import { FiscalCalendar, FiscalPeriod } from '../../../domain/settings/aggregates/FiscalCalendar';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { FiscalYear } from '../../../domain/settings/valueobjects/FiscalYear';
import { FiscalCalendarId } from '../../../domain/settings/valueobjects/FiscalCalendarId';

export class SupabaseFiscalRepository implements IFiscalRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    private toDomain(row: any): FiscalCalendar {
        const periods = (row.periods || []).map((p: any) => new FiscalPeriod(
            p.id,
            p.name,
            new Date(p.start_date),
            new Date(p.end_date),
            p.status
        ));

        return FiscalCalendar.load(
            new FiscalCalendarId(row.id),
            new OrganizationId(row.organization_id),
            new FiscalYear(row.year),
            periods,
            new Date(row.created_at)
        );
    }

    private toPersistence(calendar: FiscalCalendar): any {
        return {
            id: calendar.id.value,
            organization_id: calendar.organizationId.value,
            year: calendar.year.value,
            periods: calendar.periods.map(p => ({
                id: p.id,
                name: p.name,
                start_date: p.startDate.toISOString(),
                end_date: p.endDate.toISOString(),
                status: p.status
            })),
            created_at: calendar.createdAt.toISOString()
        };
    }

    public async save(calendar: FiscalCalendar): Promise<void> {
        const { error } = await this.supabase
            .from('fiscal_calendars')
            .upsert(this.toPersistence(calendar))
            .eq('id', calendar.id.value)
            .eq('organization_id', calendar.organizationId.value);
        if (error) throw error;
    }

    public async findByYear(organizationId: OrganizationId, year: FiscalYear): Promise<FiscalCalendar | null> {
        const { data, error } = await this.supabase
            .from('fiscal_calendars')
            .select('*')
            .eq('organization_id', organizationId.value)
            .eq('year', year.value)
            .single();
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data ? this.toDomain(data) : null;
    }

    public async findByOrganization(organizationId: OrganizationId): Promise<FiscalCalendar[]> {
        const { data, error } = await this.supabase
            .from('fiscal_calendars')
            .select('*')
            .eq('organization_id', organizationId.value);
        if (error) throw error;
        return (data || []).map(row => this.toDomain(row));
    }
}
