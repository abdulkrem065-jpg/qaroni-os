import { Request, Response, NextFunction } from 'express';
import { AuthorizationService } from '../../application/authorization/AuthorizationService';
import { AuthorizationContext } from '../../application/authorization/AuthorizationContext';
import { AuthFailureHandler } from './AuthFailureHandler';
import { IEventBus } from '../../application/ports/IEventBus';
import { AuthorizationChecked } from '../../domain/iam/events/IamDomainEvents';
import { AuthorizationDecisionType } from '../../application/authorization/AuthorizationDecision';

export class PermissionGuard {
    constructor(
        private authorizationService: AuthorizationService,
        private eventBus: IEventBus
    ) {}

    public require(action: string, resource: string) {
        return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                const context = req.securityContext;
                if (!context || !context.userId || !context.organizationId) {
                    AuthFailureHandler.handle(res, 401, 'Unauthenticated');
                    return;
                }

                const authContext = new AuthorizationContext(
                    context.userId,
                    context.organizationId,
                    context.branchId
                );

                const result = await this.authorizationService.authorize(authContext, action, resource);

                if (result.isAllowed) {
                    await this.eventBus.publish(new AuthorizationChecked(context.userId, action, resource));
                    return next();
                }

                switch (result.decision.type) {
                    case AuthorizationDecisionType.DISABLED_USER:
                        AuthFailureHandler.handle(res, 423, result.decision.reason || 'User Disabled');
                        return;
                    case AuthorizationDecisionType.DISABLED_ORGANIZATION:
                        AuthFailureHandler.handle(res, 424, result.decision.reason || 'Organization Disabled');
                        return;
                    case AuthorizationDecisionType.DISABLED_BRANCH:
                        AuthFailureHandler.handle(res, 425, result.decision.reason || 'Branch Disabled');
                        return;
                    case AuthorizationDecisionType.MISSING_PERMISSION:
                        AuthFailureHandler.handle(res, 403, result.decision.reason || 'Missing Permission');
                        return;
                    default:
                        AuthFailureHandler.handle(res, 403, result.decision.reason || 'Forbidden');
                        return;
                }

            } catch (error) {
                AuthFailureHandler.handle(res, 500, 'Internal Server Error during authorization');
            }
        };
    }
}
