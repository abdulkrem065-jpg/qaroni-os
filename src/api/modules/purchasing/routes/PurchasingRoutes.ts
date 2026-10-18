import { RouteRegistry, HttpMethod } from '../../../routing/RouteRegistry';
import { PurchasingController } from '../controllers/PurchasingController';
import { PurchasingValidation } from '../validation/PurchasingValidation';
import { SecurityPipeline } from '../../../security/SecurityPipeline';

export class PurchasingRoutes {
    public static register(registry: RouteRegistry, controller: PurchasingController, securityPipeline: SecurityPipeline): void {
        const basePath = '/api/v1/organizations/:organizationId/purchases';

        registry.register({
            path: basePath,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('create', 'purchase_order'),
                PurchasingValidation.validateCreateOrder
            ],
            handler: controller.createPurchaseOrder
        });

        registry.register({
            path: basePath,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'purchase_order'),
            handler: controller.listPurchaseOrders
        });

        registry.register({
            path: `${basePath}/:id`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'purchase_order'),
            handler: controller.getPurchaseOrder
        });

        registry.register({
            path: `${basePath}/:id/items`,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('update', 'purchase_order'),
                PurchasingValidation.validateItem
            ],
            handler: controller.addPurchaseItem
        });

        registry.register({
            path: `${basePath}/:id/items/:itemId`,
            method: HttpMethod.PUT,
            middlewares: [
                ...securityPipeline.buildSecureRoute('update', 'purchase_order'),
                PurchasingValidation.validateItem
            ],
            handler: controller.updatePurchaseItem
        });

        registry.register({
            path: `${basePath}/:id/items/:itemId`,
            method: HttpMethod.DELETE,
            middlewares: securityPipeline.buildSecureRoute('update', 'purchase_order'),
            handler: controller.removePurchaseItem
        });

        registry.register({
            path: `${basePath}/:id/approve`,
            method: HttpMethod.POST,
            middlewares: securityPipeline.buildSecureRoute('approve', 'purchase_order'),
            handler: controller.approvePurchaseOrder
        });

        registry.register({
            path: `${basePath}/:id/cancel`,
            method: HttpMethod.POST,
            middlewares: securityPipeline.buildSecureRoute('delete', 'purchase_order'),
            handler: controller.cancelPurchaseOrder
        });

        registry.register({
            path: `${basePath}/:id/receive`,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('receive', 'purchase_order'),
                PurchasingValidation.validateReceiveGoods
            ],
            handler: controller.receiveGoods
        });

        registry.register({
            path: `${basePath}/:id/invoice`,
            method: HttpMethod.POST,
            middlewares: securityPipeline.buildSecureRoute('create', 'purchase_invoice'),
            handler: controller.generateInvoice
        });

        registry.register({
            path: `${basePath}/:id/payments`,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('create', 'purchase_payment'),
                PurchasingValidation.validatePayment
            ],
            handler: controller.registerPayment
        });
    }
}
