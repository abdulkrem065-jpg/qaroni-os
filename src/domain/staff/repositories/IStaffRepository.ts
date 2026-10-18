import { Staff } from '../aggregates/Staff';
import { StaffId } from '../../shared/valueobjects/StaffId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { EmployeeNumber } from '../../shared/valueobjects/EmployeeNumber';
import { BranchId } from '../../shared/valueobjects/BranchId';

export interface IStaffRepository {
    save(staff: Staff): Promise<void>;
    findById(id: StaffId): Promise<Staff | null>;
    findByOrganizationIdAndId(organizationId: OrganizationId, id: StaffId): Promise<Staff | null>;
    findAllByOrganizationId(organizationId: OrganizationId): Promise<Staff[]>;
    findByOrganizationIdAndEmployeeNumber(organizationId: OrganizationId, employeeNumber: EmployeeNumber): Promise<Staff | null>;
    findAllByBranchId(branchId: BranchId): Promise<Staff[]>;
}
