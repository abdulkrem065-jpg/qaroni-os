import { IApiModule } from '../../ApiModuleRegistration';
import { RouteRegistry } from '../../../routing/RouteRegistry';
import { StaffRoutes } from './StaffRoutes';
import { StaffController } from '../controllers/StaffController';
import { ApiDependencyInjectionIntegration } from '../../../di/ApiDependencyInjectionIntegration';
import { StaffUseCases } from '../../../../application/usecases/staff/StaffUseCases';
import { SecurityPipeline } from '../../../security/SecurityPipeline';

export class StaffModule implements IApiModule {
    public registerRoutes(registry: RouteRegistry): void {
        const resolver = ApiDependencyInjectionIntegration.getResolver();
        
        const staffUseCases = resolver.resolve('staffUseCases') as StaffUseCases;
        const securityPipeline = resolver.resolve('securityPipeline') as unknown as SecurityPipeline;
        
        const controller = new StaffController(staffUseCases);
        
        StaffRoutes.register(registry, controller, securityPipeline);
    }
}
