import { describe, it, expect, beforeEach } from 'vitest';
import { Staff } from '../../../src/domain/staff/aggregates/Staff';
import { StaffId } from '../../../src/domain/shared/valueobjects/StaffId';
import { OrganizationId } from '../../../src/domain/shared/valueobjects/OrganizationId';
import { BranchId } from '../../../src/domain/shared/valueobjects/BranchId';
import { EmployeeNumber } from '../../../src/domain/shared/valueobjects/EmployeeNumber';
import { JobTitle } from '../../../src/domain/shared/valueobjects/JobTitle';
import { EmploymentDate } from '../../../src/domain/shared/valueobjects/EmploymentDate';
import { StaffProfile, StaffEmployment, EmploymentStatus } from '../../../src/domain/staff/types/StaffTypes';
import { RoleId } from '../../../src/domain/iam/value-objects/RoleId';

describe('Staff Aggregate', () => {
    let baseProfile: StaffProfile;
    let baseEmployment: StaffEmployment;

    beforeEach(() => {
        baseProfile = { firstName: 'John', lastName: 'Doe', email: 'john@example.com' };
        baseEmployment = {
            employeeNumber: EmployeeNumber.create('EMP001'),
            jobTitle: JobTitle.create('Developer'),
            hireDate: EmploymentDate.create(new Date('2023-01-01'))
        };
    });

    it('should create a valid active staff member', () => {
        const staff = Staff.create(
            new StaffId('staff-1'),
            new OrganizationId('org-1'),
            new BranchId('branch-1'),
            baseProfile,
            baseEmployment
        );

        expect(staff.status).toBe(EmploymentStatus.ACTIVE);
        expect(staff.roles.length).toBe(0);
        expect(staff.domainEvents.length).toBe(1);
        expect(staff.domainEvents[0].eventName).toBe('StaffCreatedEvent');
    });

    it('should prevent mutating archived staff', () => {
        const staff = Staff.create(
            new StaffId('staff-1'),
            new OrganizationId('org-1'),
            new BranchId('branch-1'),
            baseProfile,
            baseEmployment
        );

        staff.archive();

        expect(() => staff.updateProfile({ ...baseProfile, firstName: 'Jane' })).toThrow('Operation not allowed on archived staff');
        expect(() => staff.suspend()).toThrow('Operation not allowed on archived staff');
        expect(() => staff.activate()).toThrow('Operation not allowed on archived staff');
    });

    it('should allow role assignment and removal', () => {
        const staff = Staff.create(
            new StaffId('staff-1'),
            new OrganizationId('org-1'),
            new BranchId('branch-1'),
            baseProfile,
            baseEmployment
        );

        const roleId = new RoleId('role-1');
        staff.assignRole(roleId);
        expect(staff.roles).toContain('role-1');

        expect(() => staff.assignRole(roleId)).toThrow('Staff already has this role');

        staff.removeRole(roleId);
        expect(staff.roles).not.toContain('role-1');
    });

    it('should prevent branch transfer to same branch', () => {
        const staff = Staff.create(
            new StaffId('staff-1'),
            new OrganizationId('org-1'),
            new BranchId('branch-1'),
            baseProfile,
            baseEmployment
        );

        expect(() => staff.transfer(new BranchId('branch-1'))).toThrow('Staff is already assigned to this branch');
    });
});
