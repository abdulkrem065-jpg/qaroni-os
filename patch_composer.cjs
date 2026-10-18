const fs = require('fs');
let content = fs.readFileSync('src/application/composition/ApplicationComposer.ts', 'utf-8');

// Replace mockConfig with real config adapter or just use the config manager
const newImports = `
import { ConfigurationManager } from '../platform/configuration/runtime/ConfigurationManager';
import { RuntimeConfigurationLoader } from '../platform/configuration/runtime/RuntimeConfigurationLoader';
import { ConfigurationProvider } from '../platform/configuration/runtime/ConfigurationProvider';
import { ConfigurationValidator } from '../platform/configuration/runtime/ConfigurationValidator';
import { SecretResolver } from '../platform/configuration/secret/SecretResolver';
import { LocalSecretProvider } from '../../infrastructure/platform/configuration/secret/providers/LocalSecretProvider';
import { EnvironmentType, EnvironmentProfile } from '../../domain/platform/ports/IConfigurationEngine';
import { InMemoryAuditBackend } from '../platform/observability/audit/AuditBackend';
import { LocalEventBus } from '../../infrastructure/events/LocalEventBus';
`;

content = content.replace("import { Application } from './Application';", "import { Application } from './Application';\n" + newImports);

// Find registerInfrastructure
const infrastructurePattern = /public registerInfrastructure\(\): this \{[\s\S]*?return this;\n    \}/;
const newInfra = `
    public registerInfrastructure(): this {
        const secretProvider = new LocalSecretProvider();
        const secretResolver = new SecretResolver(secretProvider);
        const configProvider = new ConfigurationProvider(secretResolver);
        const configValidator = new ConfigurationValidator();
        const auditStream = new InMemoryAuditBackend();
        const loader = new RuntimeConfigurationLoader(configProvider, configValidator, auditStream);
        const configManager = new ConfigurationManager(loader, EnvironmentType.PRODUCTION, EnvironmentProfile.PROD);
        
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
`;

content = content.replace(infrastructurePattern, newInfra.trim());
fs.writeFileSync('src/application/composition/ApplicationComposer.ts', content);
