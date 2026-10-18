import { IApiModule } from '../../ApiModuleRegistration';
import { RouteRegistry } from '../../../routing/RouteRegistry';
import { PurchasingRoutes } from './PurchasingRoutes';
import { PurchasingController } from '../controllers/PurchasingController';
import { ApiDependencyInjectionIntegration } from '../../../di/ApiDependencyInjectionIntegration';
import { PurchasingUseCases } from '../../../../application/usecases/purchasing/PurchasingUseCases';
import { SecurityPipeline } from '../../../security/SecurityPipeline';

export class PurchasingModule implements IApiModule {
    public registerRoutes(registry: RouteRegistry): void {
        const resolver = ApiDependencyInjectionIntegration.getResolver();
        
        const purchasingUseCases = resolver.resolve('purchasingUseCases') as PurchasingUseCases;
        const securityPipeline = resolver.resolve('securityPipeline') as unknown as SecurityPipeline;
        
        const controller = new PurchasingController(purchasingUseCases);
        
        PurchasingRoutes.register(registry, controller, securityPipeline);
    }
}
