import { RouteRegistry, HttpMethod } from '../../../routing/RouteRegistry';
import { SupplierController } from '../controllers/SupplierController';
import { SupplierValidation } from '../validation/SupplierValidation';
import { SecurityPipeline } from '../../../security/SecurityPipeline';

export class SupplierRoutes {
    public static register(registry: RouteRegistry, controller: SupplierController, securityPipeline: SecurityPipeline): void {
        const basePath = '/api/v1/organizations/:organizationId/suppliers';

        registry.register({
            path: basePath,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('create', 'supplier'),
                SupplierValidation.validateCreate
            ],
            handler: controller.createSupplier
        });

        registry.register({
            path: `${basePath}/:id`,
            method: HttpMethod.PUT,
            middlewares: [
                ...securityPipeline.buildSecureRoute('update', 'supplier'),
                SupplierValidation.validateUpdate
            ],
            handler: controller.updateSupplier
        });

        registry.register({
            path: basePath,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'supplier'),
            handler: controller.listSuppliers
        });

        registry.register({
            path: `${basePath}/:id`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'supplier'),
            handler: controller.getSupplier
        });

        registry.register({
            path: `${basePath}/:id/activate`,
            method: HttpMethod.PATCH,
            middlewares: securityPipeline.buildSecureRoute('update', 'supplier'),
            handler: controller.activateSupplier
        });

        registry.register({
            path: `${basePath}/:id/suspend`,
            method: HttpMethod.PATCH,
            middlewares: securityPipeline.buildSecureRoute('update', 'supplier'),
            handler: controller.suspendSupplier
        });

        registry.register({
            path: `${basePath}/:id/archive`,
            method: HttpMethod.PATCH,
            middlewares: securityPipeline.buildSecureRoute('delete', 'supplier'),
            handler: controller.archiveSupplier
        });
    }
}
