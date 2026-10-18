import { RequestHandler } from 'express';
import { SecurityContextMiddleware } from './SecurityContextMiddleware';
import { AuthenticationMiddleware } from './AuthenticationMiddleware';
import { OrganizationResolutionMiddleware } from './OrganizationResolutionMiddleware';
import { BranchResolutionMiddleware } from './BranchResolutionMiddleware';
import { TenantIsolationMiddleware } from './TenantIsolationMiddleware';
import { AuthorizationMiddleware } from './AuthorizationMiddleware';
import { PermissionGuard } from './PermissionGuard';

export class SecurityPipeline {
    constructor(
        private authenticationMiddleware: AuthenticationMiddleware,
        private tenantIsolationMiddleware: TenantIsolationMiddleware,
        private authorizationMiddleware: AuthorizationMiddleware,
        private permissionGuard: PermissionGuard
    ) {}

    public buildSecureRoute(action: string, resource: string): RequestHandler[] {
        return [
            SecurityContextMiddleware.handle,
            this.authenticationMiddleware.handle,
            OrganizationResolutionMiddleware.handle,
            BranchResolutionMiddleware.handle,
            this.tenantIsolationMiddleware.handle,
            this.authorizationMiddleware.handle,
            this.permissionGuard.require(action, resource)
        ];
    }

    public buildAuthenticatedRoute(): RequestHandler[] {
        return [
            SecurityContextMiddleware.handle,
            this.authenticationMiddleware.handle,
            OrganizationResolutionMiddleware.handle,
            BranchResolutionMiddleware.handle,
            this.tenantIsolationMiddleware.handle
        ];
    }
}
