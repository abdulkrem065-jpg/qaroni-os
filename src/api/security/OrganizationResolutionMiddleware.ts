import { Request, Response, NextFunction } from 'express';
import { AuthFailureHandler } from './AuthFailureHandler';

export class OrganizationResolutionMiddleware {
    public static handle(req: Request, res: Response, next: NextFunction): void {
        const context = req.securityContext;
        if (!context || !context.organizationId) {
            AuthFailureHandler.handle(res, 424, 'Organization Context Missing or Disabled');
            return;
        }
        next();
    }
}
