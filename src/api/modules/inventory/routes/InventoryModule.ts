import { IApiModule } from '../../ApiModuleRegistration';
import { RouteRegistry } from '../../../routing/RouteRegistry';
import { InventoryRoutes } from './InventoryRoutes';
import { InventoryController } from '../controllers/InventoryController';
import { ApiDependencyInjectionIntegration } from '../../../di/ApiDependencyInjectionIntegration';
import { InventoryUseCases } from '../../../../application/usecases/inventory/InventoryUseCases';
import { SecurityPipeline } from '../../../security/SecurityPipeline';

export class InventoryModule implements IApiModule {
    public registerRoutes(registry: RouteRegistry): void {
        const resolver = ApiDependencyInjectionIntegration.getResolver();
        
        const inventoryUseCases = resolver.resolve('inventoryUseCases') as InventoryUseCases;
        const securityPipeline = resolver.resolve('securityPipeline') as unknown as SecurityPipeline;
        
        const controller = new InventoryController(inventoryUseCases);
        
        InventoryRoutes.register(registry, controller, securityPipeline);
    }
}
