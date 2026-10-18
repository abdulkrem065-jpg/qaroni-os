import { IApiModule } from '../../../modules/ApiModuleRegistration';
import { RouteRegistry, HttpMethod } from '../../../routing/RouteRegistry';
import { BranchController } from '../controllers/BranchController';
import { BranchValidation } from '../validation/BranchValidation';

export class BranchModule implements IApiModule {
    public registerRoutes(registry: RouteRegistry): void {
        const controller = new BranchController();

        registry.register({
            path: '/organizations/:organizationId/branches',
            method: HttpMethod.POST,
            handler: controller.create.bind(controller),
            middlewares: [BranchValidation.validateCreate]
        });

        registry.register({
            path: '/organizations/:organizationId/branches',
            method: HttpMethod.GET,
            handler: controller.list.bind(controller)
        });

        registry.register({
            path: '/organizations/:organizationId/branches/:branchId',
            method: HttpMethod.GET,
            handler: controller.getById.bind(controller)
        });

        registry.register({
            path: '/organizations/:organizationId/branches/:branchId',
            method: HttpMethod.PUT,
            handler: controller.update.bind(controller),
            middlewares: [BranchValidation.validateUpdate]
        });

        registry.register({
            path: '/organizations/:organizationId/branches/:branchId/activate',
            method: HttpMethod.PATCH,
            handler: controller.activate.bind(controller),
            middlewares: [BranchValidation.validateAction]
        });

        registry.register({
            path: '/organizations/:organizationId/branches/:branchId/deactivate',
            method: HttpMethod.PATCH,
            handler: controller.deactivate.bind(controller),
            middlewares: [BranchValidation.validateAction]
        });

        registry.register({
            path: '/organizations/:organizationId/branches/:branchId/archive',
            method: HttpMethod.PATCH,
            handler: controller.archive.bind(controller),
            middlewares: [BranchValidation.validateAction]
        });
    }
}
