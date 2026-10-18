import { RouteRegistry, HttpMethod } from '../../../routing/RouteRegistry';
import { InventoryController } from '../controllers/InventoryController';
import { InventoryValidation } from '../validation/InventoryValidation';
import { SecurityPipeline } from '../../../security/SecurityPipeline';

export class InventoryRoutes {
    public static register(registry: RouteRegistry, controller: InventoryController, securityPipeline: SecurityPipeline): void {
        const basePath = '/api/v1/organizations/:organizationId/branches/:branchId/inventory';

        registry.register({
            path: `${basePath}`,
            method: HttpMethod.GET,
            middlewares: securityPipeline.buildSecureRoute('read', 'inventory'),
            handler: controller.getInventory
        });

        registry.register({
            path: `${basePath}/receive`,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('receive', 'inventory'),
                InventoryValidation.validateReceiveStock
            ],
            handler: controller.receiveStock
        });

        registry.register({
            path: `${basePath}/issue`,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('issue', 'inventory'),
                InventoryValidation.validateIssueStock
            ],
            handler: controller.issueStock
        });

        registry.register({
            path: `${basePath}/transfer`,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('transfer', 'inventory'),
                InventoryValidation.validateTransferStock
            ],
            handler: controller.transferStock
        });

        registry.register({
            path: `${basePath}/adjust`,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('adjust', 'inventory'),
                InventoryValidation.validateAdjustStock
            ],
            handler: controller.adjustStock
        });
    }
}
