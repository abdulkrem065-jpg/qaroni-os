import { RouteRegistry, HttpMethod } from '../../../routing/RouteRegistry';
import { StaffController } from '../controllers/StaffController';
import { StaffValidation } from '../validation/StaffValidation';
import { SecurityPipeline } from '../../../security/SecurityPipeline';

export class StaffRoutes {
    public static register(registry: RouteRegistry, controller: StaffController, securityPipeline: SecurityPipeline): void {
        const basePath = '/api/v1/organizations/:organizationId/staff';

        registry.register({
            path: `${basePath}`,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('create', 'staff'),
                StaffValidation.validateCreateStaff
            ],
            handler: controller.createStaff
        });

        registry.register({
            path: `${basePath}`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'staff'),
            handler: controller.listStaff
        });

        registry.register({
            path: `${basePath}/:staffId`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'staff'),
            handler: controller.getStaff
        });

        registry.register({
            path: `${basePath}/:staffId`,
            method: HttpMethod.PUT,
            middlewares: [
                ...securityPipeline.buildSecureRoute('update', 'staff'),
                StaffValidation.validateUpdateStaff
            ],
            handler: controller.updateStaff
        });

        registry.register({
            path: `${basePath}/:staffId/activate`,
            method: HttpMethod.PATCH,
            middlewares: securityPipeline.buildSecureRoute('activate', 'staff'),
            handler: controller.activateStaff
        });

        registry.register({
            path: `${basePath}/:staffId/suspend`,
            method: HttpMethod.PATCH,
            middlewares: securityPipeline.buildSecureRoute('suspend', 'staff'),
            handler: controller.suspendStaff
        });

        registry.register({
            path: `${basePath}/:staffId/archive`,
            method: HttpMethod.PATCH,
            middlewares: securityPipeline.buildSecureRoute('archive', 'staff'),
            handler: controller.archiveStaff
        });

        registry.register({
            path: `${basePath}/:staffId/transfer`,
            method: HttpMethod.PATCH,
            middlewares: [
                ...securityPipeline.buildSecureRoute('transfer', 'staff'),
                StaffValidation.validateTransferStaff
            ],
            handler: controller.transferBranch
        });

        registry.register({
            path: `${basePath}/:staffId/roles`,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('assign_role', 'staff'),
                StaffValidation.validateAssignRole
            ],
            handler: controller.assignRole
        });

        registry.register({
            path: `${basePath}/:staffId/roles/:roleId`,
            method: HttpMethod.DELETE,
            middlewares: securityPipeline.buildSecureRoute('remove_role', 'staff'),
            handler: controller.removeRole
        });
    }
}
