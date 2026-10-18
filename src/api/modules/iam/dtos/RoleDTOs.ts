export interface CreateRoleRequestDTO {
    id: string;
    organizationId: string;
    name: string;
    description: string;
}

export interface UpdateRoleRequestDTO {
    name: string;
    description: string;
}

export interface RoleResponseDTO {
    id: string;
    organizationId: string;
    name: string;
    description: string;
    permissions: string[];
}

import { Role } from '../../../../domain/iam/aggregates/Role';

export class RoleMapper {
    public static toDTO(role: Role): RoleResponseDTO {
        return {
            id: role.id.value,
            organizationId: role.organizationId.value,
            name: role.name,
            description: "", // role.description removed from aggregate
            permissions: role.permissionIds.map(p => p.value)
        };
    }
}
