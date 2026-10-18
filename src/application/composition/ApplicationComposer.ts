import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ApiBootstrap } from '../../api/bootstrap/ApiBootstrap';
import { ApiDependencyInjectionIntegration } from '../../api/di/ApiDependencyInjectionIntegration';
import { ApiModuleRegistration } from '../../api/modules/ApiModuleRegistration';
import { OrganizationModule } from '../../api/modules/organization/routes/OrganizationRoutes';
import { BranchModule } from '../../api/modules/branch/routes/BranchRoutes';
import { StaffModule } from '../../api/modules/staff/routes/StaffModule';
import { ProductModule } from '../../api/modules/product/routes/ProductModule';
import { InventoryModule } from '../../api/modules/inventory/routes/InventoryModule';
import { SupabaseProductRepository } from '../../infrastructure/persistence/supabase/product/SupabaseProductRepository';
import { SupabaseInventoryRepository } from '../../infrastructure/persistence/supabase/inventory/SupabaseInventoryRepository';
import { SupabaseStockMovementRepository } from '../../infrastructure/persistence/supabase/inventory/SupabaseStockMovementRepository';
import { ProductUseCases } from '../usecases/product/ProductUseCases';
import { InventoryUseCases } from '../usecases/inventory/InventoryUseCases';
import { SalesModule } from '../../api/modules/sales/routes/SalesModule';
import { PurchasingModule } from '../../api/modules/purchasing/routes/PurchasingModule';
import { SupabasePurchaseOrderRepository } from '../../infrastructure/persistence/supabase/purchasing/SupabasePurchaseOrderRepository';
import { SupabasePurchaseInvoiceRepository } from '../../infrastructure/persistence/supabase/purchasing/SupabasePurchaseInvoiceRepository';
import { SupabaseGoodsReceiptRepository } from '../../infrastructure/persistence/supabase/purchasing/SupabaseGoodsReceiptRepository';
import { PurchasingUseCases } from '../usecases/purchasing/PurchasingUseCases';
import { SupabaseSupplierRepository } from '../../infrastructure/persistence/supabase/supplier/SupabaseSupplierRepository';
import { SupplierUseCases } from '../usecases/supplier/SupplierUseCases';
import { SupplierModule } from '../../api/modules/supplier/routes/SupplierModule';
import { SupabaseSalesOrderRepository } from '../../infrastructure/persistence/supabase/sales/SupabaseSalesOrderRepository';
import { SupabaseSalesInvoiceRepository } from '../../infrastructure/persistence/supabase/sales/SupabaseSalesInvoiceRepository';
import { SupabasePaymentRepository } from '../../infrastructure/persistence/supabase/sales/SupabasePaymentRepository';
import { SupabaseReceiptRepository } from '../../infrastructure/persistence/supabase/sales/SupabaseReceiptRepository';
import { SalesUseCases } from '../usecases/sales/SalesUseCases';
import { ProductionSecurityPipeline } from '../../api/security/ProductionSecurityPipeline';
import { jwtValidatorMiddleware } from '../../api/middleware/JwtValidatorMiddleware';
import { sessionValidatorMiddleware } from '../../api/middleware/SessionValidatorMiddleware';
import { AuthorizationMiddleware } from '../../api/security/AuthorizationMiddleware';
import { PermissionGuard } from '../../api/security/PermissionGuard';
import { AuthorizationPolicy } from '../authorization/AuthorizationPolicy';
import { SupabaseStaffRepository } from '../../infrastructure/persistence/supabase/staff/SupabaseStaffRepository';
import { StaffUseCases } from '../usecases/staff/StaffUseCases';


import { SchedulerRegistry } from '../platform/scheduler/SchedulerRegistry';
import { SchedulerExecutor } from '../platform/scheduler/SchedulerExecutor';
import { SchedulerEngine } from '../platform/scheduler/SchedulerEngine';
import { SchedulerManager } from '../platform/scheduler/SchedulerManager';
import { SchedulerHealthMonitor } from '../platform/scheduler/SchedulerHealthMonitor';
import { RedisDistributedLock } from '../../infrastructure/platform/scheduler/RedisDistributedLock';
import { BullMQQueueProvider } from '../../infrastructure/platform/queue/bullmq/BullMQQueueProvider';
import { BullMQDeadLetterQueue } from '../../infrastructure/platform/queue/bullmq/BullMQDeadLetterQueue';
import { BullMQFailedJobRepository } from '../../infrastructure/platform/queue/bullmq/BullMQFailedJobRepository';
import { QueueDispatcher } from '../platform/queue/QueueDispatcher';
import { QueueManager } from '../platform/queue/QueueManager';
import { QueueWorker } from '../platform/queue/QueueWorker';
import { QueueSupervisor } from '../platform/queue/QueueSupervisor';
import { QueueHealthMonitor } from '../platform/queue/QueueHealthMonitor';
import { DeadLetterQueue } from '../platform/queue/DeadLetterQueue';
import { IdempotencyManager } from '../platform/queue/IdempotencyManager';
import { Application } from './Application';

import { ConfigurationManager } from '../platform/configuration/runtime/ConfigurationManager';
import { RuntimeConfigurationLoader } from '../platform/configuration/runtime/RuntimeConfigurationLoader';
import { ConfigurationProvider } from '../platform/configuration/runtime/ConfigurationProvider';
import { ConfigurationValidator } from '../platform/configuration/runtime/ConfigurationValidator';
import { SecretResolver } from '../platform/configuration/secret/SecretResolver';
import { LocalSecretProvider } from '../../infrastructure/platform/configuration/secret/providers/LocalSecretProvider';
import { EnvironmentType, EnvironmentProfile } from '../../domain/platform/ports/IConfigurationEngine';
import { InMemoryAuditBackend } from '../platform/observability/audit/AuditBackend';
import { LocalEventBus } from '../../infrastructure/events/LocalEventBus';

import { CompositionVerifier } from './CompositionVerifier';

import { SupabaseOrganizationRepository } from '../../infrastructure/persistence/supabase/SupabaseOrganizationRepository';
import { SupabaseBranchRepository } from '../../infrastructure/persistence/supabase/SupabaseBranchRepository';
import { SupabaseUserRepository } from '../../infrastructure/persistence/supabase/iam/SupabaseUserRepository';
import { SupabaseRoleRepository } from '../../infrastructure/persistence/supabase/iam/SupabaseRoleRepository';
import { SupabasePermissionRepository } from '../../infrastructure/persistence/supabase/iam/SupabasePermissionRepository';

import { 
    CreateOrganizationUseCase, 
    UpdateOrganizationSettingsUseCase,
    DeactivateOrganizationUseCase, 
    DeleteOrganizationUseCase, 
    GetOrganizationByIdUseCase, 
    GetAllOrganizationsUseCase 
} from '../usecases/organization/OrganizationUseCases';
import { 
    CreateBranchUseCase, 
    UpdateBranchUseCase, 
    ActivateBranchUseCase,
    DeactivateBranchUseCase as DeactivateBranchUseCaseAlias, 
    ArchiveBranchUseCase, 
    GetBranchUseCase, 
    ListBranchesUseCase 
} from '../usecases/organization/BranchUseCases';

import { CreateUserUseCase } from '../usecases/iam/user/CreateUserUseCase';
import { AssignRoleUseCase } from '../usecases/iam/role/AssignRoleUseCase';
import { RevokeRoleUseCase } from '../usecases/iam/role/RevokeRoleUseCase';
import { DeleteUserUseCase } from '../usecases/iam/user/DeleteUserUseCase';
import { GetUserUseCase } from '../usecases/iam/user/GetUserUseCase';
import { ListUsersUseCase } from '../usecases/iam/user/ListUsersUseCase';
import { UpdateUserUseCase } from '../usecases/iam/user/UpdateUserUseCase';
import { ActivateUserUseCase } from '../usecases/iam/user/ActivateUserUseCase';
import { SuspendUserUseCase } from '../usecases/iam/user/SuspendUserUseCase';

import { CreateRoleUseCase } from '../usecases/iam/role/CreateRoleUseCase';
import { UpdateRoleUseCase } from '../usecases/iam/role/UpdateRoleUseCase';
import { ListRolesUseCase } from '../usecases/iam/role/ListRolesUseCase';
import { GrantPermissionUseCase } from '../usecases/iam/permission/GrantPermissionUseCase';
import { RevokePermissionUseCase } from '../usecases/iam/permission/RevokePermissionUseCase';
import { DeleteRoleUseCase } from '../usecases/iam/role/DeleteRoleUseCase';

import { CreatePermissionUseCase } from '../usecases/iam/permission/CreatePermissionUseCase';
import { DeletePermissionUseCase } from '../usecases/iam/permission/DeletePermissionUseCase';
import { ListPermissionsUseCase } from '../usecases/iam/permission/ListPermissionsUseCase';

import { SupabaseCustomerRepository } from '../../infrastructure/customer/repositories/SupabaseCustomerRepository';
import { CustomerUseCases } from '../customer/usecases/CustomerUseCases';
import { CustomerModule } from '../../api/modules/customer/CustomerModule';

import { SupabaseCurrencyRepository } from '../../infrastructure/settings/repositories/SupabaseCurrencyRepository';
import { SupabaseExchangeRateRepository } from '../../infrastructure/settings/repositories/SupabaseExchangeRateRepository';
import { SupabaseFiscalRepository } from '../../infrastructure/settings/repositories/SupabaseFiscalRepository';
import { SupabaseTaxRepository } from '../../infrastructure/settings/repositories/SupabaseTaxRepository';
import { SupabaseNumberSequenceRepository } from '../../infrastructure/settings/repositories/SupabaseNumberSequenceRepository';
import { SupabaseOrganizationFinancialSettingsRepository } from '../../infrastructure/settings/repositories/SupabaseOrganizationFinancialSettingsRepository';
import { OrganizationFinancialSettingsUseCases } from '../../application/settings/usecases/OrganizationFinancialSettingsUseCases';
import { SettingsUseCases } from '../../application/settings/usecases/SettingsUseCases';
import { SettingsModule } from '../../api/modules/settings/SettingsModule';
import { SupabaseAccountRepository } from '../../infrastructure/accounting/repositories/SupabaseAccountRepository';
import { SupabaseJournalRepository } from '../../infrastructure/accounting/repositories/SupabaseJournalRepository';
import { SupabaseJournalLineRepository } from '../../infrastructure/accounting/repositories/SupabaseJournalLineRepository';
import { SupabasePostingRepository } from '../../infrastructure/accounting/repositories/SupabasePostingRepository';
import { SupabaseLedgerEntryRepository } from '../../infrastructure/accounting/repositories/SupabaseLedgerEntryRepository';
import { SupabaseLedgerBalanceRepository } from '../../infrastructure/accounting/repositories/SupabaseLedgerBalanceRepository';
import { SupabaseTrialBalanceRepository } from '../../infrastructure/accounting/repositories/SupabaseTrialBalanceRepository';
import { SupabaseLedgerEntryQuery } from '../../infrastructure/accounting/repositories/SupabaseLedgerEntryQuery';
import { SupabaseBalanceSheetRepository } from '../../infrastructure/accounting/repositories/SupabaseBalanceSheetRepository';
import { SupabaseFinancialValidationRepository } from '../../infrastructure/accounting/repositories/SupabaseFinancialValidationRepository';
import { SupabaseIncomeStatementRepository } from '../../infrastructure/accounting/repositories/SupabaseIncomeStatementRepository';

import { RedisConnectionManager } from '../../infrastructure/platform/cache/redis/RedisConnectionManager';
import { RedisCacheProvider } from '../../infrastructure/platform/cache/redis/RedisCacheProvider';
import { CacheService } from '../platform/cache/CacheService';
import { setGlobalCacheService } from '../platform/cache/decorators/CacheDecorators';
import { SupabaseCashFlowRepository } from '../../infrastructure/accounting/repositories/SupabaseCashFlowRepository';
import { SupabaseFinancialRatiosRepository } from '../../infrastructure/accounting/repositories/SupabaseFinancialRatiosRepository';
import { DefaultIncomeStatementClassificationService } from '../../infrastructure/accounting/services/DefaultIncomeStatementClassificationService';
import { DefaultAccountClassificationService } from '../../infrastructure/accounting/services/DefaultAccountClassificationService';
import { AccountUseCases } from '../../application/accounting/usecases/AccountUseCases';
import { JournalUseCases } from '../../application/accounting/usecases/JournalUseCases';
import { AccountingCycleUseCases } from '../../application/accounting/usecases/AccountingCycleUseCases';
import { PostingUseCases } from '../../application/accounting/usecases/PostingUseCases';
import { GeneralLedgerUseCases } from '../../application/accounting/usecases/GeneralLedgerUseCases';
import { TrialBalanceUseCases } from '../../application/accounting/usecases/TrialBalanceUseCases';
import { BalanceSheetUseCases } from '../../application/accounting/usecases/BalanceSheetUseCases';
import { FinancialValidationUseCases } from '../../application/accounting/usecases/FinancialValidationUseCases';
import { IncomeStatementUseCases } from '../../application/accounting/usecases/IncomeStatementUseCases';
import { CashFlowUseCases } from '../../application/accounting/usecases/CashFlowUseCases';
import { FinancialRatiosUseCases } from '../../application/accounting/usecases/FinancialRatiosUseCases';
import { PostingCompletedEventHandler } from '../../application/accounting/events/GeneralLedgerEventHandlers';
import { AccountingModule } from '../../api/modules/accounting/AccountingModule';

export class ApplicationComposer {
    private state: any = {
        supabase: null,
        repositories: {},
        useCases: {},
        api: null,
        eventBus: null
    };

    public static create(): ApplicationComposer {
        return new ApplicationComposer();
    }

    public registerInfrastructure(): this {
        const secretProvider = new LocalSecretProvider();
        const secretResolver = new SecretResolver(secretProvider);
        const configProvider = new ConfigurationProvider(secretResolver);
        const configValidator = new ConfigurationValidator();
        const auditStream = new InMemoryAuditBackend();
        const loader = new RuntimeConfigurationLoader(configProvider, configValidator, auditStream);
        const configManager = new ConfigurationManager(loader, EnvironmentType.PRODUCTION, EnvironmentProfile.GOOGLE_CLOUD);
        
        const redisConnectionManager = new RedisConnectionManager(configManager as any);
        const redisCacheProvider = new RedisCacheProvider(redisConnectionManager);
        const cacheService = new CacheService(redisCacheProvider, configManager as any);
        const bullmqProvider = new BullMQQueueProvider(redisConnectionManager);
        const bullmqDlq = new BullMQDeadLetterQueue(redisConnectionManager);
        const bullmqFailedJobs = new BullMQFailedJobRepository(redisConnectionManager);
        
        const queueDispatcher = new QueueDispatcher(bullmqProvider);
        const queueManager = new QueueManager(bullmqProvider);
        const queueWorker = new QueueWorker(bullmqProvider);
        const queueSupervisor = new QueueSupervisor(bullmqProvider);
        const queueHealthMonitor = new QueueHealthMonitor(bullmqProvider);
        const deadLetterQueue = new DeadLetterQueue(bullmqDlq);
        const idempotencyManager = new IdempotencyManager(cacheService);
        const distributedLock = new RedisDistributedLock(redisConnectionManager);
        const schedulerRegistry = new SchedulerRegistry();
        const schedulerExecutor = new SchedulerExecutor(queueDispatcher);
        const schedulerEngine = new SchedulerEngine(schedulerRegistry, schedulerExecutor, distributedLock);
        const schedulerManager = new SchedulerManager(schedulerRegistry, schedulerEngine);
        const schedulerHealthMonitor = new SchedulerHealthMonitor(schedulerRegistry);

        schedulerRegistry.registerSystemJobs().catch(console.error);

        (this.state as any).schedulerEngine = schedulerEngine;
        (this.state as any).schedulerManager = schedulerManager;
        
        (this.state as any).queueDispatcher = queueDispatcher;
        (this.state as any).queueWorker = queueWorker;

        setGlobalCacheService(cacheService);
        (this.state as any).cacheService = cacheService;

        const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:8000';
        const supabaseKey = process.env.SUPABASE_ANON_KEY || 'dummy_key';
        this.state.supabase = createClient(supabaseUrl, supabaseKey);
        
        this.state.eventBus = new LocalEventBus();
        
        return this;
    }

    public registerRepositories(): this {
        const db = this.state.supabase;
        this.state.repositories = {
            organization: new SupabaseOrganizationRepository(db),
            branch: new SupabaseBranchRepository(db),
            user: new SupabaseUserRepository(db),
            role: new SupabaseRoleRepository(db),
            permission: new SupabasePermissionRepository(db),
            staff: new SupabaseStaffRepository(db),
            product: new SupabaseProductRepository(db),
            inventory: new SupabaseInventoryRepository(db),
            stockMovement: new SupabaseStockMovementRepository(db),
            salesOrder: new SupabaseSalesOrderRepository(db),
            salesInvoice: new SupabaseSalesInvoiceRepository(db),
            payment: new SupabasePaymentRepository(db),
            receipt: new SupabaseReceiptRepository(db),
            purchaseOrder: new SupabasePurchaseOrderRepository(db),
            purchaseInvoice: new SupabasePurchaseInvoiceRepository(db),
            goodsReceipt: new SupabaseGoodsReceiptRepository(db),
            supplier: new SupabaseSupplierRepository(db),
            customer: new SupabaseCustomerRepository(db),
            currency: new SupabaseCurrencyRepository(db),
            exchangeRate: new SupabaseExchangeRateRepository(db),
            fiscal: new SupabaseFiscalRepository(db),
            tax: new SupabaseTaxRepository(db),
            sequence: new SupabaseNumberSequenceRepository(db),
            orgSettings: new SupabaseOrganizationFinancialSettingsRepository(db),
            account: new SupabaseAccountRepository(db),
            journal: new SupabaseJournalRepository(db),
            journalLine: new SupabaseJournalLineRepository(db),
            posting: new SupabasePostingRepository(db),
            ledgerEntry: new SupabaseLedgerEntryRepository(db),
            ledgerBalance: new SupabaseLedgerBalanceRepository(db),
            trialBalance: new SupabaseTrialBalanceRepository(db),
            balanceSheet: new SupabaseBalanceSheetRepository(db),
            financialValidation: new SupabaseFinancialValidationRepository(db),
            incomeStatement: new SupabaseIncomeStatementRepository(db),
            cashFlow: new SupabaseCashFlowRepository(db),
            financialRatios: new SupabaseFinancialRatiosRepository(db),
            incomeClassification: new DefaultIncomeStatementClassificationService(),
            accountClassification: new DefaultAccountClassificationService(),
            ledgerEntryQuery: new SupabaseLedgerEntryQuery(db)
        };
        return this;
    }

    public registerUseCases(): this {
        const r = this.state.repositories;
        const e = this.state.eventBus;
        this.state.useCases = {
            createOrganization: new CreateOrganizationUseCase(r.organization, e),
            updateOrganizationSettings: new UpdateOrganizationSettingsUseCase(r.organization, e),
            deactivateOrganization: new DeactivateOrganizationUseCase(r.organization, e),
            deleteOrganization: new DeleteOrganizationUseCase(r.organization, e),
            getOrganizationById: new GetOrganizationByIdUseCase(r.organization),
            getAllOrganizations: new GetAllOrganizationsUseCase(r.organization),

            createBranch: new CreateBranchUseCase(r.branch, e),
            updateBranch: new UpdateBranchUseCase(r.branch, e),
            activateBranch: new ActivateBranchUseCase(r.branch, e),
            deactivateBranch: new DeactivateBranchUseCaseAlias(r.branch, e),
            archiveBranch: new ArchiveBranchUseCase(r.branch, e),
            getBranch: new GetBranchUseCase(r.branch),
            listBranches: new ListBranchesUseCase(r.branch),

            createUser: new CreateUserUseCase(r.user, e),
            assignRole: new AssignRoleUseCase(r.role, r.user, e),
            revokeRole: new RevokeRoleUseCase(r.role, r.user, e),
            deleteUser: new DeleteUserUseCase(r.user, e),
            getUser: new GetUserUseCase(r.user),
            listUsers: new ListUsersUseCase(r.user),
            updateUser: new UpdateUserUseCase(r.user, e),
            activateUser: new ActivateUserUseCase(r.user, e),
            suspendUser: new SuspendUserUseCase(r.user, e),
            
            createRole: new CreateRoleUseCase(r.role, e),
            updateRole: new UpdateRoleUseCase(r.role, e),
            listRoles: new ListRolesUseCase(r.role),
            grantPermission: new GrantPermissionUseCase(r.role, r.permission, e),
            revokePermission: new RevokePermissionUseCase(r.role, r.permission, e),
            deleteRole: new DeleteRoleUseCase(r.role),
            
            createPermission: new CreatePermissionUseCase(r.permission),
            deletePermission: new DeletePermissionUseCase(r.permission),
            listPermissions: new ListPermissionsUseCase(r.permission),
            staffUseCases: new StaffUseCases(r.staff, e),
            productUseCases: new ProductUseCases(r.product, e),
            inventoryUseCases: new InventoryUseCases(r.inventory, r.product, r.stockMovement, e),
            salesUseCases: new SalesUseCases(r.salesOrder, r.salesInvoice, r.payment, r.receipt, new InventoryUseCases(r.inventory, r.product, r.stockMovement, e), e),
            purchasingUseCases: new PurchasingUseCases(r.purchaseOrder, r.purchaseInvoice, r.goodsReceipt, new InventoryUseCases(r.inventory, r.product, r.stockMovement, e), e, r.supplier),
            supplierUseCases: new SupplierUseCases(r.supplier, e),
            customerUseCases: new CustomerUseCases(r.customer, e),
            settingsUseCases: new SettingsUseCases(r.currency, r.exchangeRate, r.fiscal, r.tax, r.sequence, e),
            orgSettingsUseCases: new OrganizationFinancialSettingsUseCases(r.orgSettings, e),
            accountUseCases: new AccountUseCases(r.account, e),
            journalUseCases: new JournalUseCases(r.journal, r.journalLine, e),
            accountingCycleUseCases: new AccountingCycleUseCases(r.fiscal as any, r.trialBalance, r.journal, r.accountClassification as any, e),
            postingUseCases: new PostingUseCases(r.posting, r.journal, r.fiscal as any, e),
            generalLedgerUseCases: new GeneralLedgerUseCases(r.ledgerEntry, r.ledgerBalance, r.posting, r.journal, r.journalLine, e),
            trialBalanceUseCases: new TrialBalanceUseCases(r.trialBalance, r.ledgerEntryQuery),
            balanceSheetUseCases: new BalanceSheetUseCases(r.balanceSheet, r.trialBalance, r.accountClassification),
            financialValidationUseCases: new FinancialValidationUseCases(r.financialValidation, r.account, r.posting, r.trialBalance, r.balanceSheet, r.ledgerEntryQuery, e),
            incomeStatementUseCases: new IncomeStatementUseCases(r.incomeStatement, r.trialBalance, r.financialValidation, r.incomeClassification, e),
            cashFlowUseCases: new CashFlowUseCases(r.cashFlow, r.balanceSheet, r.incomeStatement, r.financialValidation, e),
            financialRatiosUseCases: new FinancialRatiosUseCases(r.financialRatios, r.balanceSheet, r.incomeStatement, r.cashFlow, r.financialValidation, e),
        };
        return this;
    }

    public registerApi(): this {
        this.state.api = new ApiBootstrap();
        const resolver = ApiDependencyInjectionIntegration.getResolver();
        
        for (const [name, useCase] of Object.entries(this.state.useCases)) {
            resolver.register(name, useCase);
        }

        const registry = this.state.api.getRegistry();
        ApiModuleRegistration.register(new OrganizationModule(), registry);
        ApiModuleRegistration.register(new BranchModule(), registry);
        resolver.register('securityPipeline', new ProductionSecurityPipeline(
            jwtValidatorMiddleware,
            sessionValidatorMiddleware,
            new AuthorizationMiddleware({} as any, {} as any),
            new PermissionGuard({} as any, {} as any)
        ) as any);
        ApiModuleRegistration.register(new StaffModule(), registry);
        ApiModuleRegistration.register(new ProductModule(), registry);
        ApiModuleRegistration.register(new InventoryModule(), registry);
        ApiModuleRegistration.register(new SalesModule(), registry);
        ApiModuleRegistration.register(new PurchasingModule(), registry);
        ApiModuleRegistration.register(new SupplierModule(), registry);
        ApiModuleRegistration.register(new CustomerModule(), registry);
        ApiModuleRegistration.register(new SettingsModule(), registry);
        ApiModuleRegistration.register(new AccountingModule(), registry);

        return this;
    }

    public verifyDependencyGraph(): this {
        CompositionVerifier.verify(this.state);
        return this;
    }

    public compose(): Application {
        return new Application(this.state.api, this.state.supabase);
    }
}
