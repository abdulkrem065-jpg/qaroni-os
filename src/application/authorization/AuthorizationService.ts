import { UserId } from '../../domain/iam/value-objects/UserId';
import { AuthorizationContext } from './AuthorizationContext';
import { AuthorizationResult } from './AuthorizationResult';
import { AuthorizationDecision, AuthorizationDecisionType } from './AuthorizationDecision';
import { PermissionEvaluator } from './PermissionEvaluator';
import { EffectivePermissionCalculator } from './EffectivePermissionCalculator';
import { AuthorizationPolicy } from './AuthorizationPolicy';
import { IUserRepository } from '../../domain/iam/repositories/IUserRepository';
import { IOrganizationVerificationService } from '../authentication/interfaces/IOrganizationVerificationService';
import { IBranchVerificationService } from '../authentication/interfaces/IBranchVerificationService';
import { IEventBus } from '../ports/IEventBus';
import { AuthorizationSucceeded, AuthorizationDenied, PolicyEvaluated } from '../../domain/iam/events/IamDomainEvents';

export class AuthorizationService {
    constructor(
        private userRepository: IUserRepository,
        private permissionEvaluator: PermissionEvaluator,
        private effectivePermissionCalculator: EffectivePermissionCalculator,
        private orgVerification: IOrganizationVerificationService,
        private branchVerification: IBranchVerificationService,
        private eventBus: IEventBus
    ) {}

    public async authorize(
        context: AuthorizationContext,
        action: string,
        resource: string,
        policies?: AuthorizationPolicy[]
    ): Promise<AuthorizationResult> {
        // 1. Verify User exists and is active
        const user = await this.userRepository.findById(context.userId);
        if (!user) {
            return this.deny(context, action, resource, AuthorizationDecisionType.NOT_FOUND, 'User not found');
        }

        if (!user.isActive) {
            return this.deny(context, action, resource, AuthorizationDecisionType.DISABLED_USER, 'User is disabled or inactive');
        }

        // 2. Verify Organization is active
        const isOrgActive = await this.orgVerification.isOrganizationActive(user.organizationId.value);
        if (!isOrgActive) {
            return this.deny(context, action, resource, AuthorizationDecisionType.DISABLED_ORGANIZATION, 'Organization is disabled');
        }

        // 4. Resolve Effective Permissions
        const effectivePermissions = await this.permissionEvaluator.evaluate(context);

        // 5. Evaluate Required Permission
        const hasPermission = this.effectivePermissionCalculator.hasPermission(effectivePermissions, action, resource);
        
        if (!hasPermission) {
            return this.deny(context, action, resource, AuthorizationDecisionType.MISSING_PERMISSION, `Missing permission for action: ${action} on resource: ${resource}`);
        }

        // 6. Evaluate Policies (if any provided)
        if (policies && policies.length > 0) {
            for (const policy of policies) {
                const passed = policy.evaluate(context, effectivePermissions);
                await this.eventBus.publish(new PolicyEvaluated(policy.name, passed));
                if (!passed) {
                    return this.deny(context, action, resource, AuthorizationDecisionType.DENY, `Policy evaluation failed: ${policy.name}`);
                }
            }
        }

        // 7. Return Allow
        await this.eventBus.publish(new AuthorizationSucceeded(context.userId, action, resource));
        return new AuthorizationResult(AuthorizationDecision.allow(), action, resource);
    }

    private async deny(
        context: AuthorizationContext,
        action: string,
        resource: string,
        type: AuthorizationDecisionType,
        reason: string
    ): Promise<AuthorizationResult> {
        await this.eventBus.publish(new AuthorizationDenied(context.userId, action, resource, reason));
        return new AuthorizationResult(AuthorizationDecision.deny(type, reason), action, resource);
    }
}
