import { Request, Response } from 'express';
import { CreatePermissionUseCase } from '../../../../application/usecases/iam/permission/CreatePermissionUseCase';
import { DeletePermissionUseCase } from '../../../../application/usecases/iam/permission/DeletePermissionUseCase';
import { ListPermissionsUseCase } from '../../../../application/usecases/iam/permission/ListPermissionsUseCase';
import { ResponseFormatter } from '../../../common/ResponseFormatter';
import { CreatePermissionRequestDTO, PermissionMapper } from '../dtos/PermissionDTOs';

export class PermissionController {
    constructor(
        private createPermissionUseCase: CreatePermissionUseCase,
        private deletePermissionUseCase: DeletePermissionUseCase,
        private listPermissionsUseCase: ListPermissionsUseCase
    ) {}

    public create = async (req: Request, res: Response): Promise<void> => {
        try {
            const dto: CreatePermissionRequestDTO = req.body;
            const orgId = req.securityContext?.organizationId;
            if (!orgId) return ResponseFormatter.error(res, 'Organization Context Missing', 400);

            if (dto.organizationId && dto.organizationId !== orgId) {
                 return ResponseFormatter.error(res, 'Cannot create permission for different organization', 403);
            }
            
            await this.createPermissionUseCase.execute(dto.id, dto.organizationId || orgId, dto.name, dto.action, dto.resource);
            ResponseFormatter.success(res, { message: 'Permission created' }, 201);
        } catch (error: any) {
            ResponseFormatter.error(res, error.message, 400);
        }
    };

    public delete = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id;
            await this.deletePermissionUseCase.execute(id);
            ResponseFormatter.success(res, { message: 'Permission deleted' });
        } catch (error: any) {
            ResponseFormatter.error(res, error.message, 400);
        }
    };

    public list = async (req: Request, res: Response): Promise<void> => {
        try {
            const orgId = req.securityContext?.organizationId;
            if (!orgId) return ResponseFormatter.error(res, 'Organization Context Missing', 400);

            const permissions = await this.listPermissionsUseCase.execute(orgId);
            ResponseFormatter.success(res, permissions.map(p => PermissionMapper.toDTO(p)));
        } catch (error: any) {
            ResponseFormatter.error(res, error.message, 400);
        }
    };
}
