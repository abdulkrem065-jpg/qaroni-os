import { IStaffRepository } from '../../../../domain/staff/repositories/IStaffRepository';
import { Staff } from '../../../../domain/staff/aggregates/Staff';
import { StaffId } from '../../../../domain/shared/valueobjects/StaffId';
import { OrganizationId } from '../../../../domain/shared/valueobjects/OrganizationId';
import { BranchId } from '../../../../domain/shared/valueobjects/BranchId';
import { EmployeeNumber } from '../../../../domain/shared/valueobjects/EmployeeNumber';
import { JobTitle } from '../../../../domain/shared/valueobjects/JobTitle';
import { EmploymentDate } from '../../../../domain/shared/valueobjects/EmploymentDate';
import { StaffProfile, StaffEmployment, EmploymentStatus } from '../../../../domain/staff/types/StaffTypes';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseStaffRepository implements IStaffRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    private mapToDomain(row: any): Staff {
        const profile: StaffProfile = {
            firstName: row.first_name,
            lastName: row.last_name,
            email: row.email,
            phone: row.phone
        };
        const employment: StaffEmployment = {
            employeeNumber: EmployeeNumber.create(row.employee_number),
            jobTitle: JobTitle.create(row.job_title),
            hireDate: EmploymentDate.create(new Date(row.hire_date)),
            terminationDate: row.termination_date ? EmploymentDate.create(new Date(row.termination_date)) : undefined
        };
        
        return Staff.load(
            new StaffId(row.id),
            new OrganizationId(row.organization_id),
            new BranchId(row.branch_id),
            profile,
            employment,
            row.status as EmploymentStatus,
            row.roles || []
        );
    }

    private mapToRow(staff: Staff): any {
        return {
            id: staff.id.value,
            organization_id: staff.organizationId.value,
            branch_id: staff.branchId.value,
            first_name: staff.profile.firstName,
            last_name: staff.profile.lastName,
            email: staff.profile.email,
            phone: staff.profile.phone,
            employee_number: staff.employment.employeeNumber.value,
            job_title: staff.employment.jobTitle.value,
            hire_date: staff.employment.hireDate.value.toISOString(),
            termination_date: staff.employment.terminationDate?.value.toISOString() || null,
            status: staff.status,
            roles: staff.roles
        };
    }

    public async save(staff: Staff): Promise<void> {
        const row = this.mapToRow(staff);
        const { error } = await this.supabase
            .from('staff')
            .upsert(row);

        if (error) {
            throw new Error(`Failed to save staff: ${error.message}`);
        }
    }

    public async findById(id: StaffId): Promise<Staff | null> {
        const { data, error } = await this.supabase
            .from('staff')
            .select('*')
            .eq('id', id.value)
            .single();

        if (error || !data) return null;
        return this.mapToDomain(data);
    }

    public async findByOrganizationIdAndId(organizationId: OrganizationId, id: StaffId): Promise<Staff | null> {
        const { data, error } = await this.supabase
            .from('staff')
            .select('*')
            .eq('id', id.value)
            .eq('organization_id', organizationId.value)
            .single();

        if (error || !data) return null;
        return this.mapToDomain(data);
    }

    public async findAllByOrganizationId(organizationId: OrganizationId): Promise<Staff[]> {
        const { data, error } = await this.supabase
            .from('staff')
            .select('*')
            .eq('organization_id', organizationId.value);

        if (error || !data) return [];
        return data.map(row => this.mapToDomain(row));
    }

    public async findByOrganizationIdAndEmployeeNumber(organizationId: OrganizationId, employeeNumber: EmployeeNumber): Promise<Staff | null> {
        const { data, error } = await this.supabase
            .from('staff')
            .select('*')
            .eq('organization_id', organizationId.value)
            .eq('employee_number', employeeNumber.value)
            .single();

        if (error || !data) return null;
        return this.mapToDomain(data);
    }

    public async findAllByBranchId(branchId: BranchId): Promise<Staff[]> {
        const { data, error } = await this.supabase
            .from('staff')
            .select('*')
            .eq('branch_id', branchId.value);

        if (error || !data) return [];
        return data.map(row => this.mapToDomain(row));
    }
}
