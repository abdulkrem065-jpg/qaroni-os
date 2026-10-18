import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StaffUseCases } from '../../../src/application/usecases/staff/StaffUseCases';
import { IStaffRepository } from '../../../src/domain/staff/repositories/IStaffRepository';
import { IEventBus } from '../../../src/application/ports/IEventBus';
import { Staff } from '../../../src/domain/staff/aggregates/Staff';
import { StaffId } from '../../../src/domain/shared/valueobjects/StaffId';
import { OrganizationId } from '../../../src/domain/shared/valueobjects/OrganizationId';

describe('Staff Use Cases', () => {
    let mockRepo: IStaffRepository;
    let mockEventBus: IEventBus;
    let useCases: StaffUseCases;

    beforeEach(() => {
        mockRepo = {
            save: vi.fn(),
            findById: vi.fn(),
            findByOrganizationIdAndId: vi.fn(),
            findAllByOrganizationId: vi.fn(),
            findByOrganizationIdAndEmployeeNumber: vi.fn(),
            findAllByBranchId: vi.fn()
        };
        mockEventBus = {
            publish: vi.fn(),
            publishAll: vi.fn(),
        };
        useCases = new StaffUseCases(mockRepo, mockEventBus);
    });

    it('should create staff and publish events', async () => {
        (mockRepo.findByOrganizationIdAndEmployeeNumber as any).mockResolvedValue(null);

        const staffId = await useCases.createStaff(
            'org-1',
            'branch-1',
            { firstName: 'Test', lastName: 'User', email: 'test@example.com' },
            { employeeNumber: 'EMP-99', jobTitle: 'Tester', hireDate: new Date() }
        );

        expect(staffId).toBeDefined();
        expect(mockRepo.save).toHaveBeenCalled();
        expect(mockEventBus.publishAll).toHaveBeenCalled();
    });

    it('should reject creation if employee number exists', async () => {
        (mockRepo.findByOrganizationIdAndEmployeeNumber as any).mockResolvedValue({} as Staff);

        await expect(useCases.createStaff(
            'org-1',
            'branch-1',
            { firstName: 'Test', lastName: 'User', email: 'test@example.com' },
            { employeeNumber: 'EMP-99', jobTitle: 'Tester', hireDate: new Date() }
        )).rejects.toThrow('Employee number must be unique within the organization');
    });

    it('should enforce tenant isolation when fetching staff', async () => {
        (mockRepo.findByOrganizationIdAndId as any).mockResolvedValue(null);

        await expect(useCases.getStaff('org-1', 'staff-1'))
            .rejects.toThrow('Staff not found or does not belong to this organization');
    });
});
