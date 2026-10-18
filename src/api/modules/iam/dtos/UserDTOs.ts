export interface CreateUserRequestDTO {
    id: string;
    organizationId: string;
    email: string;
    username: string;
    branchId?: string;
}

export interface UpdateUserRequestDTO {
    email?: string;
    username?: string;
}

export interface UserResponseDTO {
    id: string;
    organizationId: string;
    email: string;
    username: string;
    branchId?: string;
    isActivated: boolean;
    isSuspended: boolean;
    isDeleted: boolean;
    assignedRoles: string[];
}

import { User } from '../../../../domain/iam/aggregates/User';

export class UserMapper {
    public static toDTO(user: User): UserResponseDTO {
        return {
            id: user.id.value,
            organizationId: user.organizationId.value,
            email: user.email.value,
            username: user.name.fullName,
            branchId: undefined, // removed from aggregate
            isActivated: user.isActive,
            isSuspended: false, // removed
            isDeleted: false, // removed
            assignedRoles: user.roleIds.map(r => r.value)
        };
    }
}
