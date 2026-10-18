import { IApiModule } from '../ApiModuleRegistration';
import { RouteRegistry } from '../../routing/RouteRegistry';
import { SettingsRoutes } from './routes/SettingsRoutes';
import { SettingsController } from './controllers/SettingsController';
import { OrganizationFinancialSettingsController } from './controllers/OrganizationFinancialSettingsController';
import { OrganizationFinancialSettingsUseCases } from '../../../application/settings/usecases/OrganizationFinancialSettingsUseCases';
import { ApiDependencyInjectionIntegration } from '../../di/ApiDependencyInjectionIntegration';
import { SettingsUseCases } from '../../../application/settings/usecases/SettingsUseCases';
import { SecurityPipeline } from '../../security/SecurityPipeline';

export class SettingsModule implements IApiModule {
    public registerRoutes(registry: RouteRegistry): void {
        const resolver = ApiDependencyInjectionIntegration.getResolver();
        
        const settingsUseCases = resolver.resolve('settingsUseCases') as SettingsUseCases;
        const securityPipeline = resolver.resolve('securityPipeline') as unknown as SecurityPipeline;
        
        const controller = new SettingsController(settingsUseCases);
        const orgSettingsUseCases = resolver.resolve('orgSettingsUseCases') as OrganizationFinancialSettingsUseCases;
        const orgSettingsController = new OrganizationFinancialSettingsController(orgSettingsUseCases);
        
        SettingsRoutes.register(registry, controller, orgSettingsController, securityPipeline);
    }
}
