import { Request, Response } from 'express';
import { CreateUserUseCase } from '../../../../application/usecases/iam/user/CreateUserUseCase';
import { GetUserUseCase } from '../../../../application/usecases/iam/user/GetUserUseCase';
import { ListUsersUseCase } from '../../../../application/usecases/iam/user/ListUsersUseCase';
import { UpdateUserUseCase } from '../../../../application/usecases/iam/user/UpdateUserUseCase';
import { DeleteUserUseCase } from '../../../../application/usecases/iam/user/DeleteUserUseCase';
import { ResponseFormatter } from '../../../common/ResponseFormatter';
import { CreateUserRequestDTO, UpdateUserRequestDTO, UserMapper } from '../dtos/UserDTOs';

export class UserController {
    constructor(
        private createUserUseCase: CreateUserUseCase,
        private getUserUseCase: GetUserUseCase,
        private listUsersUseCase: ListUsersUseCase,
        private updateUserUseCase: UpdateUserUseCase,
        private deleteUserUseCase: DeleteUserUseCase
    ) {}

    public create = async (req: Request, res: Response): Promise<void> => {
        try {
            const dto: CreateUserRequestDTO = req.body;
            // Tenant isolation override: Ensure organizationId matches if provided, or inject from context
            const orgId = req.securityContext?.organizationId;
            if (!orgId) {
                 return ResponseFormatter.error(res, 'Organization Context Missing', 400);
            }
            if (dto.organizationId && dto.organizationId !== orgId) {
                 return ResponseFormatter.error(res, 'Cannot create user for different organization', 403);
            }
            
            const targetOrgId = dto.organizationId || orgId;

            await this.createUserUseCase.execute(
                dto.id,
                targetOrgId,
                dto.email,
                dto.username,
                dto.branchId
            );
            
            ResponseFormatter.success(res, { message: 'User created' }, 201);
        } catch (error: any) {
            ResponseFormatter.error(res, error.message, 400);
        }
    };

    public getById = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id;
            const user = await this.getUserUseCase.execute(id);
            if (!user) {
                return ResponseFormatter.error(res, 'User not found', 404);
            }
            
            // Check tenant isolation
            if (user.organizationId.value !== req.securityContext?.organizationId) {
                return ResponseFormatter.error(res, 'Forbidden', 403);
            }

            ResponseFormatter.success(res, UserMapper.toDTO(user));
        } catch (error: any) {
            ResponseFormatter.error(res, error.message, 400);
        }
    };

    public list = async (req: Request, res: Response): Promise<void> => {
        try {
            const orgId = req.securityContext?.organizationId;
            if (!orgId) {
                 return ResponseFormatter.error(res, 'Organization Context Missing', 400);
            }
            const users = await this.listUsersUseCase.execute(orgId);
            ResponseFormatter.success(res, users.map(u => UserMapper.toDTO(u)));
        } catch (error: any) {
            ResponseFormatter.error(res, error.message, 400);
        }
    };

    public update = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id;
            const dto: UpdateUserRequestDTO = req.body;

            const user = await this.getUserUseCase.execute(id);
            if (!user) return ResponseFormatter.error(res, 'User not found', 404);
            if (user.organizationId.value !== req.securityContext?.organizationId) {
                return ResponseFormatter.error(res, 'Forbidden', 403);
            }

            await this.updateUserUseCase.execute(id, dto.email, dto.username);
            ResponseFormatter.success(res, { message: 'User updated' });
        } catch (error: any) {
            ResponseFormatter.error(res, error.message, 400);
        }
    };

    public delete = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id;
            const user = await this.getUserUseCase.execute(id);
            if (!user) return ResponseFormatter.error(res, 'User not found', 404);
            if (user.organizationId.value !== req.securityContext?.organizationId) {
                return ResponseFormatter.error(res, 'Forbidden', 403);
            }

            await this.deleteUserUseCase.execute(id);
            ResponseFormatter.success(res, { message: 'User deleted' });
        } catch (error: any) {
            ResponseFormatter.error(res, error.message, 400);
        }
    };
}
