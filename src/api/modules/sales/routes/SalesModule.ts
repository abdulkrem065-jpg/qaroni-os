import { IApiModule } from '../../ApiModuleRegistration';
import { RouteRegistry } from '../../../routing/RouteRegistry';
import { SalesRoutes } from './SalesRoutes';
import { SalesController } from '../controllers/SalesController';
import { ApiDependencyInjectionIntegration } from '../../../di/ApiDependencyInjectionIntegration';
import { SalesUseCases } from '../../../../application/usecases/sales/SalesUseCases';
import { SecurityPipeline } from '../../../security/SecurityPipeline';

export class SalesModule implements IApiModule {
    public registerRoutes(registry: RouteRegistry): void {
        const resolver = ApiDependencyInjectionIntegration.getResolver();
        
        const salesUseCases = resolver.resolve('salesUseCases') as SalesUseCases;
        const securityPipeline = resolver.resolve('securityPipeline') as unknown as SecurityPipeline;
        
        const controller = new SalesController(salesUseCases);
        
        SalesRoutes.register(registry, controller, securityPipeline);
    }
}
