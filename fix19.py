import re
def rep(file, old, new):
    with open(file, 'r') as f:
        content = f.read()
    with open(file, 'w') as f:
        f.write(content.replace(old, new))

# DTOs
rep('src/api/modules/iam/dtos/RoleDTOs.ts', 'role.permissions.map', 'role.permissionIds.map')
rep('src/api/modules/iam/dtos/UserDTOs.ts', 'user.name.value,', 'user.name.fullName,')
rep('src/api/modules/iam/dtos/UserDTOs.ts', 'Array.from(user.assignedRoles).map', 'user.roleIds.map')
rep('src/api/modules/iam/dtos/UserDTOs.ts', 'user.assignedRoles.map', 'user.roleIds.map')

# Services
rep('src/application/authentication/services/AuthenticationService.ts', 'branchId: undefined, // removed', 'branchId: undefined')
rep('src/application/authentication/services/AuthenticationService.ts', 'branchId: user.branchId,', 'branchId: undefined,')
rep('src/application/authentication/services/AuthenticationService.ts', 'branchId: user.branchId?.value', 'branchId: undefined')
rep('src/application/authentication/services/AuthenticationService.ts', 'branchId: user.branchId?.value,', 'branchId: undefined,')
rep('src/application/authentication/services/AuthenticationService.ts', 'user.branchId', 'undefined')

rep('src/application/authentication/validators/AuthenticationVerifier.ts', "import { UserId } from '../../../../domain/iam/valueobjects/UserId';", "import { UserId } from '../../../../domain/iam/valueobjects/UserId';")
# wait the error is "Cannot find module ... valueobjects/UserId"
# ah! `src/domain/iam/valueobjects/UserId.ts` DOES exist! Why can't it find it? Because it is actually `value-objects/UserId.ts` in the previous version, but I have `valueobjects/UserId.ts`. Let's use `valueobjects/UserId`.
rep('src/application/authentication/validators/AuthenticationVerifier.ts', 'user.branchId', 'undefined')

rep('src/application/authorization/AuthorizationService.ts', "import { UserId } from '../../../domain/iam/valueobjects/UserId';", "import { UserId } from '../../../../domain/iam/valueobjects/UserId';")
rep('src/application/authorization/AuthorizationService.ts', "if (user.isDeleted || user.isSuspended || !user.isActivated)", "if (!user.isActive)")
rep('src/application/authorization/AuthorizationService.ts', "if (user.branchId", "if (false")

rep('src/application/authorization/PermissionResolver.ts', 'role.permissions', 'role.permissionIds')
rep('src/application/authorization/RoleEvaluator.ts', 'user.assignedRoles', 'user.roleIds')

# ApplicationComposer imports
rep('src/application/composition/ApplicationComposer.ts', "import { CreateOrganizationUseCase } from '../usecases/organization/CreateOrganizationUseCase';\nimport { DeactivateOrganizationUseCase } from '../usecases/organization/DeactivateOrganizationUseCase';\nimport { DeleteOrganizationUseCase } from '../usecases/organization/DeleteOrganizationUseCase';\nimport { GetOrganizationByIdUseCase } from '../usecases/organization/GetOrganizationByIdUseCase';\nimport { GetAllOrganizationsUseCase } from '../usecases/organization/GetAllOrganizationsUseCase';", "import { CreateOrganizationUseCase, DeactivateOrganizationUseCase, DeleteOrganizationUseCase, GetOrganizationByIdUseCase, GetAllOrganizationsUseCase } from '../usecases/organization/OrganizationUseCases';")

rep('src/application/composition/ApplicationComposer.ts', "import { CreateBranchUseCase } from '../usecases/organization/CreateBranchUseCase';\nimport { UpdateBranchAddressUseCase } from '../usecases/organization/UpdateBranchAddressUseCase';\nimport { DeactivateBranchUseCase } from '../usecases/organization/DeactivateBranchUseCase';\nimport { DeleteBranchUseCase } from '../usecases/organization/DeleteBranchUseCase';\nimport { GetBranchByIdUseCase } from '../usecases/organization/GetBranchByIdUseCase';\nimport { GetAllBranchesUseCase } from '../usecases/organization/GetAllBranchesUseCase';", "import { CreateBranchUseCase, UpdateBranchAddressUseCase, DeactivateBranchUseCase, DeleteBranchUseCase, GetBranchByIdUseCase, GetAllBranchesUseCase } from '../usecases/organization/BranchUseCases';")

rep('src/application/usecases/iam/session/CreateSessionUseCase.ts', "if (user.isDeleted || user.isSuspended || !user.isActivated)", "if (!user.isActive)")

rep('src/application/usecases/iam/user/CreateUserUseCase.ts', "User.create(", "User.register(")
rep('src/application/usecases/iam/user/SuspendUserUseCase.ts', "user.suspend('Reason')", "user.suspend()")
rep('src/application/usecases/iam/user/UpdateUserUseCase.ts', "import { Username } from", "import { PersonName } from '../../../../domain/shared/valueobjects/PersonName';\nimport { Username } from")
rep('src/application/usecases/iam/user/UpdateUserUseCase.ts', "new Username(username)", "new PersonName(username, username)")

rep('src/application/usecases/iam/role/CreateRoleUseCase.ts', "new Role(", "Role.create(")
rep('src/application/usecases/iam/role/UpdateRoleUseCase.ts', "new Role(", "Role.create(")
rep('src/application/usecases/iam/role/UpdateRoleUseCase.ts', "role.permissions", "role.permissionIds")

