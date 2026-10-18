export interface CreatePermissionRequestDTO {
    id: string;
    organizationId: string;
    name: string;
    action: string;
    resource: string;
}

export interface PermissionResponseDTO {
    id: string;
    organizationId: string;
    name: string;
    action: string;
    resource: string;
}

import { Permission } from '../../../../domain/iam/entities/Permission';

export class PermissionMapper {
    public static toDTO(permission: Permission): PermissionResponseDTO {
        return {
            id: permission.id.value,
            organizationId: permission.organizationId.value,
            name: permission.name,
            action: permission.action,
            resource: permission.resource
        };
    }
}
