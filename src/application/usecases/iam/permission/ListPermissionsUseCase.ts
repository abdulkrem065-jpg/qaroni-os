import { IPermissionRepository } from '../../../../domain/iam/repositories/IPermissionRepository';
import { Permission } from '../../../../domain/iam/entities/Permission';

export class ListPermissionsUseCase {
    constructor(private permissionRepository: IPermissionRepository) {}

    public async execute(organizationId: string): Promise<Permission[]> {
        return this.permissionRepository.findAll(organizationId);
    }
}
