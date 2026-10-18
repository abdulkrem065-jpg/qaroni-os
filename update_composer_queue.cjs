const fs = require('fs');
let code = fs.readFileSync('src/application/composition/ApplicationComposer.ts', 'utf8');

const importsToAdd = `
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
`;

code = code.replace("import { Application } from './Application';", importsToAdd + "import { Application } from './Application';");

const infrastructureCode = `
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
        
        // Expose in state
        (this.state as any).queueDispatcher = queueDispatcher;
        (this.state as any).queueWorker = queueWorker;
`;

code = code.replace("const cacheService = new CacheService(redisCacheProvider, mockConfig);", "const cacheService = new CacheService(redisCacheProvider, mockConfig);" + infrastructureCode);

fs.writeFileSync('src/application/composition/ApplicationComposer.ts', code);
