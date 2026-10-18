import { AuthorizationContext } from './AuthorizationContext';
import { RoleEvaluator } from './RoleEvaluator';
import { PermissionResolver } from './PermissionResolver';
import { EffectivePermissionCalculator } from './EffectivePermissionCalculator';
import { Permission } from '../../domain/iam/entities/Permission';
import { IEventBus } from '../ports/IEventBus';
import { PermissionResolved } from '../../domain/iam/events/IamDomainEvents';

export class PermissionEvaluator {
    constructor(
        private roleEvaluator: RoleEvaluator,
        private permissionResolver: PermissionResolver,
        private effectivePermissionCalculator: EffectivePermissionCalculator,
        private eventBus: IEventBus
    ) {}

    public async evaluate(context: AuthorizationContext): Promise<Permission[]> {
        const roles = await this.roleEvaluator.getRolesForUser(context.userId);
        const resolvedPermissions = await this.permissionResolver.resolveForRoles(roles);
        const effective = this.effectivePermissionCalculator.calculate(resolvedPermissions);
        
        await this.eventBus.publish(new PermissionResolved(context.userId, effective.length));

        return effective;
    }
}
