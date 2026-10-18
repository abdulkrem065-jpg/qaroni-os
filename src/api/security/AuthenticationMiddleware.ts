import { Request, Response, NextFunction } from 'express';
import { ITokenValidator } from '../../application/authentication/interfaces/ITokenValidator';
import { IEventBus } from '../../application/ports/IEventBus';
import { RequestIdentityResolver } from './RequestIdentityResolver';
import { AuthFailureHandler } from './AuthFailureHandler';
import { RequestAuthenticated, RequestRejected } from '../../domain/iam/events/IamDomainEvents';

export class AuthenticationMiddleware {
    constructor(
        private tokenValidator: ITokenValidator,
        private identityResolver: RequestIdentityResolver,
        private eventBus: IEventBus
    ) {}

    public handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.securityContext) {
                req.securityContext = {};
            }

            const token = this.identityResolver.resolve(req);
            if (!token) {
                await this.eventBus.publish(new RequestRejected('Missing Token', req.path));
                AuthFailureHandler.handle(res, 401, 'Unauthorized: Missing Token');
                return;
            }

            const context = await this.tokenValidator.validate(token);
            
            req.securityContext.token = token;
            req.securityContext.userId = context.userId;
            req.securityContext.organizationId = context.organizationId;
            req.securityContext.branchId = context.branchId;
            req.securityContext.sessionId = context.sessionId;

            await this.eventBus.publish(new RequestAuthenticated(context.userId, req.path));
            next();
        } catch (error: any) {
            await this.eventBus.publish(new RequestRejected(error.message || 'Invalid Token', req.path));
            if (error.message === 'Session Expired') {
                AuthFailureHandler.handle(res, 419, 'Session Expired');
            } else {
                AuthFailureHandler.handle(res, 401, 'Unauthorized: Invalid Token');
            }
        }
    };
}
