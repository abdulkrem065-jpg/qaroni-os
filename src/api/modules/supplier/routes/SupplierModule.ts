import { IApiModule } from '../../ApiModuleRegistration';
import { RouteRegistry } from '../../../routing/RouteRegistry';
import { SupplierRoutes } from './SupplierRoutes';
import { SupplierController } from '../controllers/SupplierController';
import { ApiDependencyInjectionIntegration } from '../../../di/ApiDependencyInjectionIntegration';
import { SupplierUseCases } from '../../../../application/usecases/supplier/SupplierUseCases';
import { SecurityPipeline } from '../../../security/SecurityPipeline';

export class SupplierModule implements IApiModule {
    public registerRoutes(registry: RouteRegistry): void {
        const resolver = ApiDependencyInjectionIntegration.getResolver();
        
        const supplierUseCases = resolver.resolve('supplierUseCases') as SupplierUseCases;
        const securityPipeline = resolver.resolve('securityPipeline') as unknown as SecurityPipeline;
        
        const controller = new SupplierController(supplierUseCases);
        
        SupplierRoutes.register(registry, controller, securityPipeline);
    }
}
