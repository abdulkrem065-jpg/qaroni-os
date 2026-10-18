import { RouteRegistry, HttpMethod } from '../../../routing/RouteRegistry';
import { ProductController } from '../controllers/ProductController';
import { ProductValidation } from '../validation/ProductValidation';
import { SecurityPipeline } from '../../../security/SecurityPipeline';

export class ProductRoutes {
    public static register(registry: RouteRegistry, controller: ProductController, securityPipeline: SecurityPipeline): void {
        const basePath = '/api/v1/organizations/:organizationId/products';

        registry.register({
            path: `${basePath}`,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('create', 'product'),
                ProductValidation.validateCreateProduct
            ],
            handler: controller.createProduct
        });

        registry.register({
            path: `${basePath}`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'product'),
            handler: controller.listProducts
        });

        registry.register({
            path: `${basePath}/:productId`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'product'),
            handler: controller.getProduct
        });

        registry.register({
            path: `${basePath}/:productId`,
            method: HttpMethod.PUT,
            middlewares: securityPipeline.buildSecureRoute('update', 'product'),
            handler: controller.updateProduct
        });

        registry.register({
            path: `${basePath}/:productId`,
            method: HttpMethod.DELETE,
            middlewares: securityPipeline.buildSecureRoute('delete', 'product'),
            handler: controller.deleteProduct
        });
    }
}
