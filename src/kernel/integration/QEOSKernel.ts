import { KernelEntryPoint } from '../bootstrap/KernelEntryPoint';
import { ConfigurationBootHook } from '../config/ConfigurationBootHook';
import { LoggerBootHook } from '../logger/LoggerBootHook';
import { EventBusBootHook } from '../eventbus/EventBusBootHook';
import { ContainerBootHook } from '../di/ContainerBootHook';
import { 
    PluginDiscoveryBootHook, 
    PluginInitializationBootHook, 
    PluginBootstrapBootHook, 
    PluginReadyBootHook 
} from '../plugin/PluginBootHook';
import { SecurityBootHook } from '../security/SecurityBootHook';
import { KernelState } from '../bootstrap/KernelState';

import { ConfigurationManager } from '../../application/platform/configuration/runtime/ConfigurationManager';
import { RuntimeConfigurationLoader } from '../../application/platform/configuration/runtime/RuntimeConfigurationLoader';
import { ConfigurationProvider } from '../../application/platform/configuration/runtime/ConfigurationProvider';
import { ConfigurationValidator } from '../../application/platform/configuration/runtime/ConfigurationValidator';
import { SecretResolver } from '../../application/platform/configuration/secret/SecretResolver';
import { LocalSecretProvider } from '../../infrastructure/platform/configuration/secret/providers/LocalSecretProvider';
import { EnvironmentType, EnvironmentProfile } from '../../domain/platform/ports/IConfigurationEngine';

import { LoggerManager } from '../../application/platform/observability/logging/StructuredLogger';
import { JsonLogFormatter } from '../../application/platform/observability/logging/LogFormatter';
import { CorrelationIdProvider } from '../../application/platform/observability/logging/CorrelationIdProvider';

import { InMemoryAuditBackend } from '../../application/platform/observability/audit/AuditBackend';
import { LocalEventBus } from '../../infrastructure/events/LocalEventBus';

import { ServiceContainer } from '../di/ServiceContainer';
import { PluginLoader } from '../plugin/PluginLoader';
import { PluginRegistry } from '../plugin/PluginRegistry';
import { PluginDependencyValidator } from '../plugin/PluginDependencyValidator';

export class QEOSKernel {
    private static instance: QEOSKernel;
    private entryPoint: KernelEntryPoint;
    private configManager: any;
    private container: any;
    private pluginLoader: any;

    private constructor() {
        this.entryPoint = KernelEntryPoint.getInstance();
    }

    public static getInstance(): QEOSKernel {
        if (!QEOSKernel.instance) {
            QEOSKernel.instance = new QEOSKernel();
        }
        return QEOSKernel.instance;
    }

    public async initialize(): Promise<void> {
        console.log('[QEOSKernel] Assembling Core Kernel Pipeline...');

        const secretProvider = new LocalSecretProvider();
        const secretResolver = new SecretResolver(secretProvider);
        const configProvider = new ConfigurationProvider(secretResolver);
        const configValidator = new ConfigurationValidator();
        const auditStream = new InMemoryAuditBackend();
        const loader = new RuntimeConfigurationLoader(configProvider, configValidator, auditStream);
        this.configManager = new ConfigurationManager(loader, EnvironmentType.DEVELOPMENT, EnvironmentProfile.LOCAL);
        const eventBus = new LocalEventBus();
        const loggerFactory = new LoggerManager(new JsonLogFormatter(), new CorrelationIdProvider());

        this.container = new ServiceContainer();
        
        const pluginRegistry = new PluginRegistry();
        const pluginValidator = new PluginDependencyValidator(pluginRegistry, '1.0.0');

        const pluginContext = {
            container: this.container,
            resolver: this.container,
            eventBus: eventBus as any,
            logger: loggerFactory as any
        };

        this.pluginLoader = new PluginLoader(pluginRegistry, pluginValidator, pluginContext as any, eventBus as any);

        const configHook = new ConfigurationBootHook(this.configManager as any, [], { validate: () => {} } as any);
        const loggerHook = new LoggerBootHook(this.configManager as any, [], loggerFactory as any);
        const eventBusHook = new EventBusBootHook(eventBus as any);
        const containerHook = new ContainerBootHook(this.container, this.configManager as any, eventBus as any, loggerFactory as any);
        
        const pluginDiscovery = new PluginDiscoveryBootHook(this.pluginLoader);
        const pluginInit = new PluginInitializationBootHook(this.pluginLoader);
        const pluginBootstrap = new PluginBootstrapBootHook(this.pluginLoader);
        const pluginReady = new PluginReadyBootHook(this.pluginLoader);

        const securityHook = new SecurityBootHook(this.container, eventBus as any, loggerFactory as any, [], [], []);

        this.entryPoint.initializationPipeline.registerHook(KernelState.PRE_BOOT, configHook);
        this.entryPoint.initializationPipeline.registerHook(KernelState.CORE_BOOT, loggerHook);
        this.entryPoint.initializationPipeline.registerHook(KernelState.CORE_BOOT, eventBusHook);
        this.entryPoint.initializationPipeline.registerHook(KernelState.CONTAINER_SETUP, containerHook);
        this.entryPoint.initializationPipeline.registerHook(KernelState.MODULE_DISCOVERY, pluginDiscovery);
        this.entryPoint.initializationPipeline.registerHook(KernelState.REGISTRATION, pluginInit);
        this.entryPoint.initializationPipeline.registerHook(KernelState.RESOLUTION, securityHook);
        this.entryPoint.initializationPipeline.registerHook(KernelState.RESOLUTION, pluginBootstrap);
        this.entryPoint.initializationPipeline.registerHook(KernelState.POST_BOOT, pluginReady);

        console.log('[QEOSKernel] Core Kernel Pipeline assembled successfully.');
    }

    public async boot(): Promise<void> {
        console.log('[QEOSKernel] Initiating boot sequence...');
        await this.entryPoint.boot();
        console.log('[QEOSKernel] Core Kernel Version 1.0 Complete and Active.');
    }

    public async shutdown(): Promise<void> {
        console.log('[QEOSKernel] Initiating graceful shutdown...');
        await this.entryPoint.shutdown();
        console.log('[QEOSKernel] Kernel Terminated.');
    }
}
