import { RouteRegistry, HttpMethod } from '../../../routing/RouteRegistry';
import { SalesController } from '../controllers/SalesController';
import { SalesValidation } from '../validation/SalesValidation';
import { SecurityPipeline } from '../../../security/SecurityPipeline';

export class SalesRoutes {
    public static register(registry: RouteRegistry, controller: SalesController, securityPipeline: SecurityPipeline): void {
        const basePath = '/api/v1/organizations/:organizationId/sales';

        // Orders
        registry.register({
            path: `${basePath}/orders`,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('create', 'sales_order'),
                SalesValidation.validateCreateOrder
            ],
            handler: controller.createOrder
        });

        registry.register({
            path: `${basePath}/orders`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'sales_order'),
            handler: controller.listOrders
        });

        registry.register({
            path: `${basePath}/orders/:orderId`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'sales_order'),
            handler: controller.getOrder
        });

        registry.register({
            path: `${basePath}/orders/:orderId/items`,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('update', 'sales_order'),
                SalesValidation.validateAddItem
            ],
            handler: controller.addItem
        });

        registry.register({
            path: `${basePath}/orders/:orderId/items/:itemId`,
            method: HttpMethod.PUT,
            middlewares: [
                ...securityPipeline.buildSecureRoute('update', 'sales_order'),
                SalesValidation.validateUpdateItem
            ],
            handler: controller.updateItem
        });

        registry.register({
            path: `${basePath}/orders/:orderId/items/:itemId`,
            method: HttpMethod.DELETE,
            middlewares: securityPipeline.buildSecureRoute('update', 'sales_order'),
            handler: controller.removeItem
        });

        registry.register({
            path: `${basePath}/orders/:orderId`,
            method: HttpMethod.DELETE,
            middlewares: securityPipeline.buildSecureRoute('delete', 'sales_order'),
            handler: controller.cancelOrder
        });

        registry.register({
            path: `${basePath}/orders/:orderId/complete`,
            method: HttpMethod.POST,
            middlewares: securityPipeline.buildSecureRoute('complete', 'sales_order'),
            handler: controller.completeOrder
        });

        registry.register({
            path: `${basePath}/orders/:orderId/invoice`,
            method: HttpMethod.POST,
            middlewares: securityPipeline.buildSecureRoute('create', 'invoice'),
            handler: controller.generateInvoice
        });

        // Invoices
        registry.register({
            path: `${basePath}/invoices/:invoiceId`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'invoice'),
            handler: controller.getInvoice
        });

        // Payments
        registry.register({
            path: `${basePath}/invoices/:invoiceId/payments`,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('create', 'payment'),
                SalesValidation.validateRegisterPayment
            ],
            handler: controller.registerPayment
        });

        registry.register({
            path: `${basePath}/payments/:paymentId/refund`,
            method: HttpMethod.POST,
            middlewares: securityPipeline.buildSecureRoute('refund', 'payment'),
            handler: controller.refundPayment
        });
    }
}
