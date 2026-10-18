import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

create_file('src/api/modules/settings/validation/SettingsValidation.ts', """import { Request, Response, NextFunction } from 'express';

export class SettingsValidation {
    public static validateCreateCurrency(req: Request, res: Response, next: NextFunction): void {
        const { code, symbol } = req.body;
        const errors = [];
        if (!code || typeof code !== 'string' || code.length !== 3) errors.push('code must be a 3-character string');
        if (!symbol || typeof symbol !== 'string') errors.push('symbol is required');
        
        if (errors.length > 0) {
            res.status(400).json({ error: 'Validation failed', details: errors });
            return;
        }
        next();
    }

    public static validateUpdateCurrency(req: Request, res: Response, next: NextFunction): void {
        const { symbol } = req.body;
        if (!symbol || typeof symbol !== 'string') {
            res.status(400).json({ error: 'Validation failed', details: ['symbol is required'] });
            return;
        }
        next();
    }

    public static validateCreateExchangeRate(req: Request, res: Response, next: NextFunction): void {
        const { fromCurrencyId, toCurrencyId, rate, effectiveDate } = req.body;
        const errors = [];
        if (!fromCurrencyId) errors.push('fromCurrencyId is required');
        if (!toCurrencyId) errors.push('toCurrencyId is required');
        if (typeof rate !== 'number' || rate <= 0) errors.push('rate must be a positive number');
        if (!effectiveDate) errors.push('effectiveDate is required');

        if (errors.length > 0) {
            res.status(400).json({ error: 'Validation failed', details: errors });
            return;
        }
        next();
    }

    public static validateCreateFiscalYear(req: Request, res: Response, next: NextFunction): void {
        const { year, periods } = req.body;
        const errors = [];
        if (typeof year !== 'number') errors.push('year must be a number');
        if (!Array.isArray(periods) || periods.length === 0) errors.push('periods must be a non-empty array');

        if (errors.length > 0) {
            res.status(400).json({ error: 'Validation failed', details: errors });
            return;
        }
        next();
    }

    public static validateCreateTaxProfile(req: Request, res: Response, next: NextFunction): void {
        const { name, rate } = req.body;
        const errors = [];
        if (!name) errors.push('name is required');
        if (typeof rate !== 'number' || rate < 0) errors.push('rate must be a non-negative number');

        if (errors.length > 0) {
            res.status(400).json({ error: 'Validation failed', details: errors });
            return;
        }
        next();
    }
    
    public static validateUpdateTaxProfile(req: Request, res: Response, next: NextFunction): void {
        const { name, rate, isActive } = req.body;
        const errors = [];
        if (!name) errors.push('name is required');
        if (typeof rate !== 'number' || rate < 0) errors.push('rate must be a non-negative number');
        if (typeof isActive !== 'boolean') errors.push('isActive must be a boolean');

        if (errors.length > 0) {
            res.status(400).json({ error: 'Validation failed', details: errors });
            return;
        }
        next();
    }

    public static validateCreateNumberSequence(req: Request, res: Response, next: NextFunction): void {
        const { entityType, prefix, pattern } = req.body;
        const errors = [];
        if (!entityType) errors.push('entityType is required');

        if (errors.length > 0) {
            res.status(400).json({ error: 'Validation failed', details: errors });
            return;
        }
        next();
    }
}
""")

create_file('src/api/modules/settings/controllers/SettingsController.ts', """import { Request, Response } from 'express';
import { SettingsUseCases } from '../../../../application/settings/usecases/SettingsUseCases';

export class SettingsController {
    constructor(private readonly useCases: SettingsUseCases) {
        this.createCurrency = this.createCurrency.bind(this);
        this.updateCurrency = this.updateCurrency.bind(this);
        this.changeBaseCurrency = this.changeBaseCurrency.bind(this);
        this.createExchangeRate = this.createExchangeRate.bind(this);
        this.createFiscalYear = this.createFiscalYear.bind(this);
        this.openFiscalPeriod = this.openFiscalPeriod.bind(this);
        this.closeFiscalPeriod = this.closeFiscalPeriod.bind(this);
        this.createTaxProfile = this.createTaxProfile.bind(this);
        this.updateTaxProfile = this.updateTaxProfile.bind(this);
        this.createNumberSequence = this.createNumberSequence.bind(this);
        this.generateNextNumber = this.generateNextNumber.bind(this);
    }

    public async createCurrency(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.useCases.createCurrency({ ...req.body, organizationId: req.params.organizationId });
            res.status(201).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    public async updateCurrency(req: Request, res: Response): Promise<void> {
        try {
            await this.useCases.updateCurrency({ ...req.body, organizationId: req.params.organizationId, currencyId: req.params.currencyId });
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    public async changeBaseCurrency(req: Request, res: Response): Promise<void> {
        try {
            await this.useCases.changeBaseCurrency(req.params.organizationId, req.params.currencyId);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    public async createExchangeRate(req: Request, res: Response): Promise<void> {
        try {
            await this.useCases.createExchangeRate({ ...req.body, organizationId: req.params.organizationId });
            res.status(201).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    public async createFiscalYear(req: Request, res: Response): Promise<void> {
        try {
            await this.useCases.createFiscalYear({ ...req.body, organizationId: req.params.organizationId });
            res.status(201).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    public async openFiscalPeriod(req: Request, res: Response): Promise<void> {
        try {
            await this.useCases.openFiscalPeriod(req.params.organizationId, Number(req.params.year), req.params.periodId);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    public async closeFiscalPeriod(req: Request, res: Response): Promise<void> {
        try {
            await this.useCases.closeFiscalPeriod(req.params.organizationId, Number(req.params.year), req.params.periodId);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    public async createTaxProfile(req: Request, res: Response): Promise<void> {
        try {
            await this.useCases.createTaxProfile({ ...req.body, organizationId: req.params.organizationId });
            res.status(201).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    public async updateTaxProfile(req: Request, res: Response): Promise<void> {
        try {
            await this.useCases.updateTaxProfile({ ...req.body, organizationId: req.params.organizationId, taxProfileId: req.params.taxProfileId });
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    public async createNumberSequence(req: Request, res: Response): Promise<void> {
        try {
            await this.useCases.createNumberSequence({ ...req.body, organizationId: req.params.organizationId });
            res.status(201).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    public async generateNextNumber(req: Request, res: Response): Promise<void> {
        try {
            const num = await this.useCases.generateNextNumber(req.params.organizationId, req.params.entityType);
            res.status(200).json({ number: num });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
""")

create_file('src/api/modules/settings/routes/SettingsRoutes.ts', """import { RouteRegistry, HttpMethod } from '../../../routing/RouteRegistry';
import { SettingsController } from '../controllers/SettingsController';
import { SettingsValidation } from '../validation/SettingsValidation';
import { SecurityPipeline } from '../../../security/SecurityPipeline';

export class SettingsRoutes {
    public static register(registry: RouteRegistry, controller: SettingsController, securityPipeline: SecurityPipeline): void {
        const basePath = '/api/v1/organizations/:organizationId/settings';

        // Currencies
        registry.register({
            path: `${basePath}/currencies`,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('create', 'currency'),
                SettingsValidation.validateCreateCurrency
            ],
            handler: controller.createCurrency
        });

        registry.register({
            path: `${basePath}/currencies/:currencyId`,
            method: HttpMethod.PUT,
            middlewares: [
                ...securityPipeline.buildSecureRoute('update', 'currency'),
                SettingsValidation.validateUpdateCurrency
            ],
            handler: controller.updateCurrency
        });

        registry.register({
            path: `${basePath}/currencies/:currencyId/base`,
            method: HttpMethod.PATCH,
            middlewares: securityPipeline.buildSecureRoute('update', 'currency'),
            handler: controller.changeBaseCurrency
        });

        // Exchange Rates
        registry.register({
            path: `${basePath}/exchange-rates`,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('create', 'exchange_rate'),
                SettingsValidation.validateCreateExchangeRate
            ],
            handler: controller.createExchangeRate
        });

        // Fiscal Calendar
        registry.register({
            path: `${basePath}/fiscal`,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('create', 'fiscal_calendar'),
                SettingsValidation.validateCreateFiscalYear
            ],
            handler: controller.createFiscalYear
        });

        registry.register({
            path: `${basePath}/fiscal/:year/periods/:periodId/open`,
            method: HttpMethod.PATCH,
            middlewares: securityPipeline.buildSecureRoute('update', 'fiscal_calendar'),
            handler: controller.openFiscalPeriod
        });

        registry.register({
            path: `${basePath}/fiscal/:year/periods/:periodId/close`,
            method: HttpMethod.PATCH,
            middlewares: securityPipeline.buildSecureRoute('update', 'fiscal_calendar'),
            handler: controller.closeFiscalPeriod
        });

        // Tax Profiles
        registry.register({
            path: `${basePath}/taxes`,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('create', 'tax_profile'),
                SettingsValidation.validateCreateTaxProfile
            ],
            handler: controller.createTaxProfile
        });

        registry.register({
            path: `${basePath}/taxes/:taxProfileId`,
            method: HttpMethod.PUT,
            middlewares: [
                ...securityPipeline.buildSecureRoute('update', 'tax_profile'),
                SettingsValidation.validateUpdateTaxProfile
            ],
            handler: controller.updateTaxProfile
        });

        // Number Sequences
        registry.register({
            path: `${basePath}/numbering`,
            method: HttpMethod.POST,
            middlewares: [
                ...securityPipeline.buildSecureRoute('create', 'number_sequence'),
                SettingsValidation.validateCreateNumberSequence
            ],
            handler: controller.createNumberSequence
        });

        registry.register({
            path: `${basePath}/numbering/:entityType/next`,
            method: HttpMethod.POST,
            middlewares: securityPipeline.buildSecureRoute('read', 'number_sequence'), // Or maybe generate?
            handler: controller.generateNextNumber
        });
    }
}
""")

create_file('src/api/modules/settings/SettingsModule.ts', """import { IApiModule } from '../../ApiModuleRegistration';
import { RouteRegistry } from '../../../routing/RouteRegistry';
import { SettingsRoutes } from './routes/SettingsRoutes';
import { SettingsController } from './controllers/SettingsController';
import { ApiDependencyInjectionIntegration } from '../../di/ApiDependencyInjectionIntegration';
import { SettingsUseCases } from '../../../../application/settings/usecases/SettingsUseCases';
import { SecurityPipeline } from '../../../security/SecurityPipeline';

export class SettingsModule implements IApiModule {
    public registerRoutes(registry: RouteRegistry): void {
        const resolver = ApiDependencyInjectionIntegration.getResolver();
        
        const settingsUseCases = resolver.resolve('settingsUseCases') as SettingsUseCases;
        const securityPipeline = resolver.resolve('securityPipeline') as unknown as SecurityPipeline;
        
        const controller = new SettingsController(settingsUseCases);
        
        SettingsRoutes.register(registry, controller, securityPipeline);
    }
}
""")

print("Settings API generated")
