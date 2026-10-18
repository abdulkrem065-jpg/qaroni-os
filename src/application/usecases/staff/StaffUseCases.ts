import { IStaffRepository } from '../../../domain/staff/repositories/IStaffRepository';
import { IEventBus } from '../../ports/IEventBus';
import { Staff } from '../../../domain/staff/aggregates/Staff';
import { StaffId } from '../../../domain/shared/valueobjects/StaffId';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { BranchId } from '../../../domain/shared/valueobjects/BranchId';
import { EmployeeNumber } from '../../../domain/shared/valueobjects/EmployeeNumber';
import { JobTitle } from '../../../domain/shared/valueobjects/JobTitle';
import { EmploymentDate } from '../../../domain/shared/valueobjects/EmploymentDate';
import { StaffProfile, StaffEmployment } from '../../../domain/staff/types/StaffTypes';
import { RoleId } from '../../../domain/iam/value-objects/RoleId';
import { ValidationError } from '../../../domain/shared/errors/ValidationError';
import { randomUUID } from 'crypto';

export class StaffUseCases {
    constructor(
        private readonly staffRepository: IStaffRepository,
        private readonly eventBus: IEventBus
    ) {}

    public async createStaff(
        organizationId: string,
        branchId: string,
        profile: StaffProfile,
        employmentData: { employeeNumber: string; jobTitle: string; hireDate: Date }
    ): Promise<string> {
        const orgId = new OrganizationId(organizationId);
        const empNumber = EmployeeNumber.create(employmentData.employeeNumber);

        const existing = await this.staffRepository.findByOrganizationIdAndEmployeeNumber(orgId, empNumber);
        if (existing) {
            throw new ValidationError('Employee number must be unique within the organization');
        }

        const staffId = new StaffId(randomUUID());
        const employment: StaffEmployment = {
            employeeNumber: empNumber,
            jobTitle: JobTitle.create(employmentData.jobTitle),
            hireDate: EmploymentDate.create(employmentData.hireDate)
        };

        const staff = Staff.create(
            staffId,
            orgId,
            new BranchId(branchId),
            profile,
            employment
        );

        await this.staffRepository.save(staff);
        await this.eventBus.publishAll(staff.domainEvents);
        staff.clearDomainEvents();

        return staffId.value;
    }

    public async updateStaff(
        organizationId: string,
        staffId: string,
        profile?: StaffProfile,
        employmentData?: { employeeNumber: string; jobTitle: string; hireDate: Date; terminationDate?: Date }
    ): Promise<void> {
        const staff = await this.getStaffOrThrow(organizationId, staffId);

        if (profile) {
            staff.updateProfile(profile);
        }

        if (employmentData) {
            const empNumber = EmployeeNumber.create(employmentData.employeeNumber);
            if (empNumber.value !== staff.employment.employeeNumber.value) {
                const existing = await this.staffRepository.findByOrganizationIdAndEmployeeNumber(new OrganizationId(organizationId), empNumber);
                if (existing) {
                    throw new ValidationError('Employee number must be unique within the organization');
                }
            }
            
            const employment: StaffEmployment = {
                employeeNumber: empNumber,
                jobTitle: JobTitle.create(employmentData.jobTitle),
                hireDate: EmploymentDate.create(employmentData.hireDate),
                terminationDate: employmentData.terminationDate ? EmploymentDate.create(employmentData.terminationDate) : undefined
            };
            staff.updateEmployment(employment);
        }

        await this.staffRepository.save(staff);
        await this.eventBus.publishAll(staff.domainEvents);
        staff.clearDomainEvents();
    }

    public async activateStaff(organizationId: string, staffId: string): Promise<void> {
        const staff = await this.getStaffOrThrow(organizationId, staffId);
        staff.activate();
        await this.staffRepository.save(staff);
        await this.eventBus.publishAll(staff.domainEvents);
        staff.clearDomainEvents();
    }

    public async suspendStaff(organizationId: string, staffId: string): Promise<void> {
        const staff = await this.getStaffOrThrow(organizationId, staffId);
        staff.suspend();
        await this.staffRepository.save(staff);
        await this.eventBus.publishAll(staff.domainEvents);
        staff.clearDomainEvents();
    }

    public async archiveStaff(organizationId: string, staffId: string): Promise<void> {
        const staff = await this.getStaffOrThrow(organizationId, staffId);
        staff.archive();
        await this.staffRepository.save(staff);
        await this.eventBus.publishAll(staff.domainEvents);
        staff.clearDomainEvents();
    }

    public async transferBranch(organizationId: string, staffId: string, newBranchId: string): Promise<void> {
        const staff = await this.getStaffOrThrow(organizationId, staffId);
        staff.transfer(new BranchId(newBranchId));
        await this.staffRepository.save(staff);
        await this.eventBus.publishAll(staff.domainEvents);
        staff.clearDomainEvents();
    }

    public async assignBranch(organizationId: string, staffId: string, newBranchId: string): Promise<void> {
        // Alias for transfer
        return this.transferBranch(organizationId, staffId, newBranchId);
    }

    public async assignRole(organizationId: string, staffId: string, roleId: string): Promise<void> {
        const staff = await this.getStaffOrThrow(organizationId, staffId);
        staff.assignRole(new RoleId(roleId));
        await this.staffRepository.save(staff);
        await this.eventBus.publishAll(staff.domainEvents);
        staff.clearDomainEvents();
    }

    public async removeRole(organizationId: string, staffId: string, roleId: string): Promise<void> {
        const staff = await this.getStaffOrThrow(organizationId, staffId);
        staff.removeRole(new RoleId(roleId));
        await this.staffRepository.save(staff);
        await this.eventBus.publishAll(staff.domainEvents);
        staff.clearDomainEvents();
    }

    public async getStaff(organizationId: string, staffId: string): Promise<Staff> {
        return this.getStaffOrThrow(organizationId, staffId);
    }

    public async listStaff(organizationId: string): Promise<Staff[]> {
        return this.staffRepository.findAllByOrganizationId(new OrganizationId(organizationId));
    }

    private async getStaffOrThrow(organizationId: string, staffId: string): Promise<Staff> {
        const staff = await this.staffRepository.findByOrganizationIdAndId(
            new OrganizationId(organizationId),
            new StaffId(staffId)
        );
        if (!staff) {
            throw new ValidationError('Staff not found or does not belong to this organization');
        }
        return staff;
    }
}
