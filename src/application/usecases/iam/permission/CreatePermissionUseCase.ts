import { IPermissionRepository } from '../../../../domain/iam/repositories/IPermissionRepository';
import { Permission } from '../../../../domain/iam/entities/Permission';
import { PermissionId } from '../../../../domain/iam/value-objects/PermissionId';
import { OrganizationId } from '../../../../domain/iam/value-objects/OrganizationId';

export class CreatePermissionUseCase {
    constructor(private permissionRepository: IPermissionRepository) {}

    public async execute(
        id: string,
        organizationId: string,
        name: string,
        action: string,
        resource: string
    ): Promise<void> {
        const permission = new Permission(
            new PermissionId(id),
            new OrganizationId(organizationId),
            name,
            action,
            resource
        );
        await this.permissionRepository.save(permission);
    }
}
