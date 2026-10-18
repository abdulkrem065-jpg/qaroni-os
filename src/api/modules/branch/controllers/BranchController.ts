import { 
    CreateBranchUseCase, 
    UpdateBranchUseCase, 
    ActivateBranchUseCase,
    DeactivateBranchUseCase, 
    ArchiveBranchUseCase,
    GetBranchUseCase, 
    ListBranchesUseCase 
} from '../../../../application/usecases/organization/BranchUseCases';
import { Request, Response, NextFunction } from 'express';
import { UseCaseResolver } from '../../../di/UseCaseResolver';
import { ApiDependencyInjectionIntegration } from '../../../di/ApiDependencyInjectionIntegration';
import { ResponseFormatter } from '../../../formatters/ResponseFormatter';
import { BranchDto } from '../dtos/BranchDto';
import { Branch } from '../../../../domain/organization/aggregates/Branch';
import * as crypto from 'crypto';

export class BranchController {
    private getResolver(): UseCaseResolver {
        return ApiDependencyInjectionIntegration.getResolver();
    }

    private toDto(branch: Branch): BranchDto {
        return {
            id: branch.id.value,
            organizationId: branch.organizationId.value,
            code: branch.code.value,
            profile: {
                name: branch.profile.name.value,
                address: {
                    street: branch.profile.address.street,
                    city: branch.profile.address.city,
                    state: branch.profile.address.state,
                    country: branch.profile.address.country,
                    postalCode: branch.profile.address.postalCode
                },
                phone: branch.profile.phone?.value,
                email: branch.profile.email?.value
            },
            settings: {
                type: branch.settings.type,
                operatingHours: branch.settings.operatingHours,
                timezone: branch.settings.timezone
            },
            status: branch.status
        };
    }

    public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const useCase = this.getResolver().resolve<CreateBranchUseCase>('createBranch');
            const { organizationId } = req.params;
            const { code, name, address, phone, email, settings } = req.body;
            const id = crypto.randomUUID();
            
            await useCase.execute(
                id, 
                organizationId, 
                code,
                name, 
                address,
                phone,
                email,
                settings
            );
            
            res.status(201).json(ResponseFormatter.success({ id }));
        } catch (error) {
            next(error);
        }
    }

    public async list(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const useCase = this.getResolver().resolve<ListBranchesUseCase>('listBranches');
            const { organizationId } = req.params;
            
            const branches = await useCase.execute(organizationId);
            
            res.status(200).json(ResponseFormatter.success(branches.map(branch => this.toDto(branch))));
        } catch (error) {
            next(error);
        }
    }

    public async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const useCase = this.getResolver().resolve<GetBranchUseCase>('getBranch');
            const { organizationId, branchId } = req.params;
            
            const branch = await useCase.execute(organizationId, branchId);
            if (!branch) {
                res.status(404).json(ResponseFormatter.error(`Branch with id ${branchId} not found in this organization`, 'NOT_FOUND'));
                return;
            }
            
            res.status(200).json(ResponseFormatter.success(this.toDto(branch)));
        } catch (error) {
            next(error);
        }
    }

    public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const useCase = this.getResolver().resolve<UpdateBranchUseCase>('updateBranch');
            const { organizationId, branchId } = req.params;
            const { profile, settings } = req.body;
            
            await useCase.execute(organizationId, branchId, profile, settings);
            
            res.status(200).json(ResponseFormatter.success({ id: branchId }));
        } catch (error) {
            next(error);
        }
    }

    public async activate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const useCase = this.getResolver().resolve<ActivateBranchUseCase>('activateBranch');
            const { organizationId, branchId } = req.params;
            
            await useCase.execute(organizationId, branchId);
            
            res.status(200).json(ResponseFormatter.success({ id: branchId }));
        } catch (error) {
            next(error);
        }
    }

    public async deactivate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const useCase = this.getResolver().resolve<DeactivateBranchUseCase>('deactivateBranch');
            const { organizationId, branchId } = req.params;
            
            await useCase.execute(organizationId, branchId);
            
            res.status(200).json(ResponseFormatter.success({ id: branchId }));
        } catch (error) {
            next(error);
        }
    }

    public async archive(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const useCase = this.getResolver().resolve<ArchiveBranchUseCase>('archiveBranch');
            const { organizationId, branchId } = req.params;
            
            await useCase.execute(organizationId, branchId);
            
            res.status(200).json(ResponseFormatter.success({ id: branchId }));
        } catch (error) {
            next(error);
        }
    }
}
