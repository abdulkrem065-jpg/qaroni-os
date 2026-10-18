import { IApiModule } from '../ApiModuleRegistration';
import { RouteRegistry } from '../../routing/RouteRegistry';
import { CustomerRoutes } from './routes/CustomerRoutes';
import { CustomerController } from './controllers/CustomerController';
import { ApiDependencyInjectionIntegration } from '../../di/ApiDependencyInjectionIntegration';
import { CustomerUseCases } from '../../../application/customer/usecases/CustomerUseCases';
import { SecurityPipeline } from '../../security/SecurityPipeline';

export class CustomerModule implements IApiModule {
    public registerRoutes(registry: RouteRegistry): void {
        const resolver = ApiDependencyInjectionIntegration.getResolver();
        
        const customerUseCases = resolver.resolve('customerUseCases') as CustomerUseCases;
        const securityPipeline = resolver.resolve('securityPipeline') as unknown as SecurityPipeline;
        
        const controller = new CustomerController(customerUseCases);
        
        CustomerRoutes.register(registry, controller, securityPipeline);
    }
}
