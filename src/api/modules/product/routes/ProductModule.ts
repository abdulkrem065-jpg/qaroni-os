import { IApiModule } from '../../ApiModuleRegistration';
import { RouteRegistry } from '../../../routing/RouteRegistry';
import { ProductRoutes } from './ProductRoutes';
import { ProductController } from '../controllers/ProductController';
import { ApiDependencyInjectionIntegration } from '../../../di/ApiDependencyInjectionIntegration';
import { ProductUseCases } from '../../../../application/usecases/product/ProductUseCases';
import { SecurityPipeline } from '../../../security/SecurityPipeline';

export class ProductModule implements IApiModule {
    public registerRoutes(registry: RouteRegistry): void {
        const resolver = ApiDependencyInjectionIntegration.getResolver();
        
        const productUseCases = resolver.resolve('productUseCases') as ProductUseCases;
        const securityPipeline = resolver.resolve('securityPipeline') as unknown as SecurityPipeline;
        
        const controller = new ProductController(productUseCases);
        
        ProductRoutes.register(registry, controller, securityPipeline);
    }
}
