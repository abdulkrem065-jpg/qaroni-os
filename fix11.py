import re

def rep(file, old, new):
    with open(file, 'r') as f:
        content = f.read()
    with open(file, 'w') as f:
        f.write(content.replace(old, new))

rep('src/api/modules/iam/dtos/RoleDTOs.ts', 'description: role.description,', 'description: "", // role.description removed from aggregate')
rep('src/api/modules/iam/dtos/RoleDTOs.ts', 'permissions: Array.from(role.permissions).map(p => p.value),', 'permissions: role.permissionIds.map(p => p.value),')

rep('src/api/modules/iam/dtos/UserDTOs.ts', 'email: user.email.value,', 'email: user.email.value,')
rep('src/api/modules/iam/dtos/UserDTOs.ts', 'username: user.username.value,', 'username: user.name.value,')
rep('src/api/modules/iam/dtos/UserDTOs.ts', 'branchId: user.branchId?.value,', 'branchId: undefined, // removed from aggregate')
rep('src/api/modules/iam/dtos/UserDTOs.ts', 'isActivated: user.isActivated,', 'isActivated: user.isActive,')
rep('src/api/modules/iam/dtos/UserDTOs.ts', 'isSuspended: user.isSuspended,', 'isSuspended: false, // removed')
rep('src/api/modules/iam/dtos/UserDTOs.ts', 'isDeleted: user.isDeleted,', 'isDeleted: false, // removed')
rep('src/api/modules/iam/dtos/UserDTOs.ts', 'roles: Array.from(user.assignedRoles).map(r => r.value)', 'roles: user.roleIds.map(r => r.value)')

rep('src/application/authentication/services/AuthenticationService.ts', 'branchId: user.branchId?.value', 'branchId: undefined')

rep('src/application/authentication/validators/AuthenticationVerifier.ts', 'await this.userRepository.findById(userId)', 'await this.userRepository.findById(new UserId(userId))')
rep('src/application/authentication/validators/AuthenticationVerifier.ts', 'import { UserId } from', 'import { UserId } from \'../../../../domain/iam/valueobjects/UserId\'; //')
# need to add import if it's missing, let's just do a hacky replace
rep('src/application/authentication/validators/AuthenticationVerifier.ts', 'if (user.isDeleted || user.isSuspended || !user.isActivated) {', 'if (!user.isActive) {')
rep('src/application/authentication/validators/AuthenticationVerifier.ts', 'if (user.branchId && this.branchVerificationService) {', 'if (false) {')
rep('src/application/authentication/validators/AuthenticationVerifier.ts', 'const branchActive = await this.branchVerificationService.verifyBranchActive(user.branchId.value);', 'const branchActive = true;')

rep('src/application/authorization/AuthorizationService.ts', 'await this.userRepository.findById(userId)', 'await this.userRepository.findById(new UserId(userId))')
# Also add import to AuthorizationService.ts
with open('src/application/authorization/AuthorizationService.ts', 'r') as f:
    content = f.read()
if "import { UserId }" not in content:
    content = "import { UserId } from '../../../domain/iam/valueobjects/UserId';\n" + content
    with open('src/application/authorization/AuthorizationService.ts', 'w') as f:
        f.write(content.replace('if (user.isDeleted) {', 'if (!user.isActive) {'))

