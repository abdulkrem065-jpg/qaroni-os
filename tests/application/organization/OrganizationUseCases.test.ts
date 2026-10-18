import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
    CreateOrganizationUseCase, 
    UpdateOrganizationSettingsUseCase, 
    DeactivateOrganizationUseCase,
    GetOrganizationByIdUseCase
} from '../../../src/application/usecases/organization/OrganizationUseCases';
import { IOrganizationRepository } from '../../../src/domain/organization/repositories/IOrganizationRepository';
import { IEventBus } from '../../../src/application/ports/IEventBus';
import { Organization } from '../../../src/domain/organization/aggregates/Organization';
import { OrganizationId } from '../../../src/domain/shared/valueobjects/OrganizationId';

describe('Organization Use Cases', () => {
    let mockRepo: any;
    let mockEventBus: any;

    beforeEach(() => {
        mockRepo = {
            exists: vi.fn(),
            save: vi.fn(),
            findById: vi.fn(),
            delete: vi.fn(),
            findAll: vi.fn()
        };
        mockEventBus = {
            publishAll: vi.fn()
        };
    });

    describe('CreateOrganizationUseCase', () => {
        it('should create and save organization', async () => {
            mockRepo.exists.mockResolvedValue(false);
            const useCase = new CreateOrganizationUseCase(mockRepo, mockEventBus);
            
            await useCase.execute('org-1', 'Test Org');

            expect(mockRepo.exists).toHaveBeenCalled();
            expect(mockRepo.save).toHaveBeenCalled();
            expect(mockEventBus.publishAll).toHaveBeenCalled();
        });

        it('should throw if organization exists', async () => {
            mockRepo.exists.mockResolvedValue(true);
            const useCase = new CreateOrganizationUseCase(mockRepo, mockEventBus);
            
            await expect(useCase.execute('org-1', 'Test Org')).rejects.toThrow('Organization with id org-1 already exists.');
        });
    });

    describe('UpdateOrganizationSettingsUseCase', () => {
        it('should update settings', async () => {
            const org = Organization.create(new OrganizationId('org-1'), 'Test Org');
            mockRepo.findById.mockResolvedValue(org);
            
            const useCase = new UpdateOrganizationSettingsUseCase(mockRepo, mockEventBus);
            await useCase.execute('org-1', 'TAX-123', 'UTC', 'USD');

            expect(mockRepo.save).toHaveBeenCalled();
            expect(mockEventBus.publishAll).toHaveBeenCalled();
            expect(org.taxId?.value).toBe('TAX-123');
            expect(org.timezone?.value).toBe('UTC');
            expect(org.currency?.code).toBe('USD');
        });
    });
});
