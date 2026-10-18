import { RouteRegistry, HttpMethod } from '../../../routing/RouteRegistry';
import { CustomerController } from '../controllers/CustomerController';
import { CustomerValidation } from '../validation/CustomerValidation';
import { SecurityPipeline } from '../../../security/SecurityPipeline';

export class CustomerRoutes {
    public static register(registry: RouteRegistry, controller: CustomerController, securityPipeline: SecurityPipeline): void {
        const basePath = '/api/v1/organizations/:organizationId/customers';

        registry.register({
            path: basePath,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('create', 'customer'),
                CustomerValidation.validateCreateCustomer
            ],
            handler: controller.createCustomer
        });

        registry.register({
            path: basePath,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'customer'),
            handler: controller.listCustomers
        });

        registry.register({
            path: `${basePath}/:customerId`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'customer'),
            handler: controller.getCustomer
        });

        registry.register({
            path: `${basePath}/:customerId`,
            method: HttpMethod.PUT,
            middlewares: [
                ...securityPipeline.buildSecureRoute('update', 'customer'),
                CustomerValidation.validateUpdateCustomer
            ],
            handler: controller.updateCustomer
        });

        registry.register({
            path: `${basePath}/:customerId/credit-limit`,
            method: HttpMethod.PATCH,
            middlewares: [
                ...securityPipeline.buildSecureRoute('update_credit_limit', 'customer'),
                CustomerValidation.validateChangeCreditLimit
            ],
            handler: controller.changeCreditLimit
        });

        registry.register({
            path: `${basePath}/:customerId/archive`,
            method: HttpMethod.PATCH,
            middlewares: securityPipeline.buildSecureRoute('archive', 'customer'),
            handler: controller.archiveCustomer
        });

        registry.register({
            path: `${basePath}/:customerId/restore`,
            method: HttpMethod.PATCH,
            middlewares: securityPipeline.buildSecureRoute('restore', 'customer'),
            handler: controller.restoreCustomer
        });
    }
}
