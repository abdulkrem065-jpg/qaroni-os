import { Request, Response, NextFunction, RequestHandler } from 'express';
import { SecurityContextMiddleware } from './SecurityContextMiddleware';
import { OrganizationResolutionMiddleware } from './OrganizationResolutionMiddleware';
import { BranchResolutionMiddleware } from './BranchResolutionMiddleware';
import { AuthorizationMiddleware } from './AuthorizationMiddleware';
import { PermissionGuard } from './PermissionGuard';

export class ProductionSecurityPipeline {
    constructor(
        private jwtValidator: RequestHandler,
        private sessionValidator: RequestHandler,
        private authorizationMiddleware: AuthorizationMiddleware,
        private permissionGuard: PermissionGuard
    ) {}

    public buildSecureRoute(action: string, resource: string): RequestHandler[] {
        return [
            SecurityContextMiddleware.handle,
            this.jwtValidator,
            this.sessionValidator,
            OrganizationResolutionMiddleware.handle,
            BranchResolutionMiddleware.handle,
            this.authorizationMiddleware.handle,
            this.permissionGuard.require(action, resource)
        ];
    }

    public buildAuthenticatedRoute(): RequestHandler[] {
        return [
            SecurityContextMiddleware.handle,
            this.jwtValidator,
            this.sessionValidator,
            OrganizationResolutionMiddleware.handle,
            BranchResolutionMiddleware.handle
        ];
    }
}
