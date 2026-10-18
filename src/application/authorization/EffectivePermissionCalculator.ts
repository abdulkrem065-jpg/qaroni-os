import { Permission } from '../../domain/iam/entities/Permission';

export class EffectivePermissionCalculator {
    public calculate(permissions: Permission[]): Permission[] {
        // RBAC currently relies on direct permissions addition.
        // In the future, Deny constraints or inheritance can be calculated here.
        return permissions;
    }

    public hasPermission(effectivePermissions: Permission[], action: string, resource: string): boolean {
        return effectivePermissions.some(p => 
            (p.action === action || p.action === '*') &&
            (p.resource === resource || p.resource === '*')
        );
    }
}
