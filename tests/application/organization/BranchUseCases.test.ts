import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
    CreateBranchUseCase,
    UpdateBranchUseCase,
    DeactivateBranchUseCase,
    GetBranchUseCase
} from '../../../src/application/usecases/organization/BranchUseCases';
import { Branch } from '../../../src/domain/organization/aggregates/Branch';
import { BranchId } from '../../../src/domain/shared/valueobjects/BranchId';
import { OrganizationId } from '../../../src/domain/shared/valueobjects/OrganizationId';
import { BranchCode } from '../../../src/domain/shared/valueobjects/BranchCode';
import { BranchName } from '../../../src/domain/shared/valueobjects/BranchName';
import { BranchAddress } from '../../../src/domain/shared/valueobjects/BranchAddress';

describe('Branch Use Cases', () => {
    let mockRepo: any;
    let mockEventBus: any;

    beforeEach(() => {
        mockRepo = {
            exists: vi.fn(),
            findByOrganizationIdAndId: vi.fn(),
            findByOrganizationIdAndCode: vi.fn(),
            findAllByOrganizationId: vi.fn(),
            save: vi.fn()
        };
        mockEventBus = {
            publishAll: vi.fn()
        };
    });

    describe('CreateBranchUseCase', () => {
        it('should create and save branch', async () => {
            mockRepo.exists.mockResolvedValue(false);
            mockRepo.findByOrganizationIdAndCode.mockResolvedValue(null);
            
            const useCase = new CreateBranchUseCase(mockRepo, mockEventBus);
            
            await useCase.execute(
                'branch-1', 
                'org-1', 
                'NYC-01', 
                'New York HQ', 
                { street: '123 Bway', city: 'NYC', state: 'NY', country: 'USA', postalCode: '10001' }
            );

            expect(mockRepo.exists).toHaveBeenCalled();
            expect(mockRepo.findByOrganizationIdAndCode).toHaveBeenCalled();
            expect(mockRepo.save).toHaveBeenCalled();
            expect(mockEventBus.publishAll).toHaveBeenCalled();
        });

        it('should throw if branch code exists in same organization', async () => {
            mockRepo.exists.mockResolvedValue(false);
            mockRepo.findByOrganizationIdAndCode.mockResolvedValue(true); // simulates existing branch
            
            const useCase = new CreateBranchUseCase(mockRepo, mockEventBus);
            
            await expect(useCase.execute(
                'branch-1', 
                'org-1', 
                'NYC-01', 
                'New York HQ', 
                { street: '123 Bway', city: 'NYC', state: 'NY', country: 'USA', postalCode: '10001' }
            )).rejects.toThrow('Branch with code NYC-01 already exists in this organization.');
        });
    });

    describe('Tenant Isolation (GetBranchUseCase)', () => {
        it('should fetch branch using organizationId', async () => {
            const branch = Branch.create(
                new BranchId('b1'), 
                new OrganizationId('org-1'), 
                BranchCode.create('C1'), 
                { name: BranchName.create('N1'), address: BranchAddress.create('S', 'C', 'S', 'C', 'P') }
            );
            mockRepo.findByOrganizationIdAndId.mockResolvedValue(branch);
            
            const useCase = new GetBranchUseCase(mockRepo);
            const result = await useCase.execute('org-1', 'b1');

            expect(mockRepo.findByOrganizationIdAndId).toHaveBeenCalledWith(expect.any(OrganizationId), expect.any(BranchId));
            expect(result).toBeDefined();
        });
    });
});
