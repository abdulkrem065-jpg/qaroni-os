import { 
    CreateOrganizationUseCase, 
    UpdateOrganizationSettingsUseCase, 
    DeactivateOrganizationUseCase, 
    DeleteOrganizationUseCase, 
    GetOrganizationByIdUseCase, 
    GetAllOrganizationsUseCase 
} from '../../../../application/usecases/organization/OrganizationUseCases';
import { Request, Response, NextFunction } from 'express';
import { UseCaseResolver } from '../../../di/UseCaseResolver';
import { ApiDependencyInjectionIntegration } from '../../../di/ApiDependencyInjectionIntegration';
import { ResponseFormatter } from '../../../formatters/ResponseFormatter';
import { OrganizationDto } from '../dtos/OrganizationDto';
import { Organization } from '../../../../domain/organization/aggregates/Organization';
import * as crypto from 'crypto';

export class OrganizationController {
    private getResolver(): UseCaseResolver {
        return ApiDependencyInjectionIntegration.getResolver();
    }

    private toDto(org: Organization): OrganizationDto {
        return {
            id: org.id.value,
            name: org.name,
            isActive: org.isActive,
            taxId: org.taxId?.value,
            timezone: org.timezone?.value,
            currency: org.currency?.code
        };
    }

    public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const useCase = this.getResolver().resolve<CreateOrganizationUseCase>('createOrganization');
            const { name } = req.body;
            const id = crypto.randomUUID();
            
            await useCase.execute(id, name);
            res.status(201).json(ResponseFormatter.success({ id }));
        } catch (error) {
            next(error);
        }
    }

    public async updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const useCase = this.getResolver().resolve<UpdateOrganizationSettingsUseCase>('updateOrganizationSettings');
            const { id } = req.params;
            const { taxId, timezone, currency } = req.body;
            
            await useCase.execute(id, taxId, timezone, currency);
            res.status(200).json(ResponseFormatter.success({ id }));
        } catch (error) {
            next(error);
        }
    }

    public async deactivate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const useCase = this.getResolver().resolve<DeactivateOrganizationUseCase>('deactivateOrganization');
            const { id } = req.params;
            
            await useCase.execute(id);
            res.status(200).json(ResponseFormatter.success({ id }));
        } catch (error) {
            next(error);
        }
    }

    public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const useCase = this.getResolver().resolve<DeleteOrganizationUseCase>('deleteOrganization');
            const { id } = req.params;
            
            await useCase.execute(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    public async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const useCase = this.getResolver().resolve<GetOrganizationByIdUseCase>('getOrganizationById');
            const { id } = req.params;
            
            const org = await useCase.execute(id);
            if (!org) {
                res.status(404).json(ResponseFormatter.error(`Organization with id ${id} not found`, 'NOT_FOUND'));
                return;
            }
            res.status(200).json(ResponseFormatter.success(this.toDto(org)));
        } catch (error) {
            next(error);
        }
    }

    public async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const useCase = this.getResolver().resolve<GetAllOrganizationsUseCase>('getAllOrganizations');
            const orgs = await useCase.execute();
            
            res.status(200).json(ResponseFormatter.success(orgs.map(org => this.toDto(org))));
        } catch (error) {
            next(error);
        }
    }
}
