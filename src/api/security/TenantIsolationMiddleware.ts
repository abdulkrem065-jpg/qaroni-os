import { Request, Response, NextFunction } from 'express';
import { AuthFailureHandler } from './AuthFailureHandler';
import { IEventBus } from '../../application/ports/IEventBus';
import { SecurityViolationDetected } from '../../domain/iam/events/IamDomainEvents';

export class TenantIsolationMiddleware {
    constructor(private eventBus: IEventBus) {}

    public handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const requestedOrg = req.params.organizationId || req.query.organizationId || req.body.organizationId;
        const contextOrg = req.securityContext?.organizationId;
        
        if (requestedOrg && contextOrg && requestedOrg !== contextOrg) {
            await this.eventBus.publish(new SecurityViolationDetected('Cross-Tenant Access Attempt', `User ${req.securityContext?.userId} attempted to access org ${requestedOrg}`));
            AuthFailureHandler.handle(res, 403, 'Cross-organization access violation');
            return;
        }
        next();
    };
}
