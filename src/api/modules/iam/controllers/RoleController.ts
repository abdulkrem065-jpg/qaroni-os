import { Request, Response } from 'express';
import { CreateRoleUseCase } from '../../../../application/usecases/iam/role/CreateRoleUseCase';
import { UpdateRoleUseCase } from '../../../../application/usecases/iam/role/UpdateRoleUseCase';
import { DeleteRoleUseCase } from '../../../../application/usecases/iam/role/DeleteRoleUseCase';
import { ListRolesUseCase } from '../../../../application/usecases/iam/role/ListRolesUseCase';
import { ResponseFormatter } from '../../../common/ResponseFormatter';
import { CreateRoleRequestDTO, UpdateRoleRequestDTO, RoleMapper } from '../dtos/RoleDTOs';

export class RoleController {
    constructor(
        private createRoleUseCase: CreateRoleUseCase,
        private updateRoleUseCase: UpdateRoleUseCase,
        private deleteRoleUseCase: DeleteRoleUseCase,
        private listRolesUseCase: ListRolesUseCase
    ) {}

    public create = async (req: Request, res: Response): Promise<void> => {
        try {
            const dto: CreateRoleRequestDTO = req.body;
            const orgId = req.securityContext?.organizationId;
            if (!orgId) return ResponseFormatter.error(res, 'Organization Context Missing', 400);
            
            if (dto.organizationId && dto.organizationId !== orgId) {
                 return ResponseFormatter.error(res, 'Cannot create role for different organization', 403);
            }
            
            await this.createRoleUseCase.execute(dto.id, dto.organizationId || orgId, dto.name, dto.description);
            ResponseFormatter.success(res, { message: 'Role created' }, 201);
        } catch (error: any) {
            ResponseFormatter.error(res, error.message, 400);
        }
    };

    public update = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id;
            const dto: UpdateRoleRequestDTO = req.body;
            
            await this.updateRoleUseCase.execute(id, dto.name, dto.description);
            ResponseFormatter.success(res, { message: 'Role updated' });
        } catch (error: any) {
            ResponseFormatter.error(res, error.message, 400);
        }
    };

    public delete = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id;
            await this.deleteRoleUseCase.execute(id);
            ResponseFormatter.success(res, { message: 'Role deleted' });
        } catch (error: any) {
            ResponseFormatter.error(res, error.message, 400);
        }
    };

    public list = async (req: Request, res: Response): Promise<void> => {
        try {
            const orgId = req.securityContext?.organizationId;
            if (!orgId) return ResponseFormatter.error(res, 'Organization Context Missing', 400);
            
            const roles = await this.listRolesUseCase.execute(orgId);
            ResponseFormatter.success(res, roles.map(r => RoleMapper.toDTO(r)));
        } catch (error: any) {
            ResponseFormatter.error(res, error.message, 400);
        }
    };
}
