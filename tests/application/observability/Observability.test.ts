import { describe, it, expect, vi } from 'vitest';
import { CorrelationIdProvider } from '../../../src/application/platform/observability/logging/CorrelationIdProvider';
import { JsonLogFormatter } from '../../../src/application/platform/observability/logging/LogFormatter';
import { LoggerManager } from '../../../src/application/platform/observability/logging/StructuredLogger';
import { MetricsRegistry } from '../../../src/application/platform/observability/metrics/MetricsRegistry';
import { HealthCheckRegistry, HealthStatusAggregator, HealthMonitor } from '../../../src/application/platform/observability/health/HealthMonitor';
import { TraceManager } from '../../../src/application/platform/observability/tracing/TraceManager';
import { InMemoryAuditBackend } from '../../../src/application/platform/observability/audit/AuditBackend';
import { AlertEngine } from '../../../src/application/platform/observability/alerts/AlertEngine';
import { SlowRequestDetector, SlowJobDetector, SlowQueryDetector } from '../../../src/application/platform/observability/diagnostics/PerformanceDiagnostics';
import { RuntimeDashboard } from '../../../src/application/platform/observability/dashboard/RuntimeDashboard';
import { HealthStatus, LogSeverity, AlertSeverity, IAlertHistory } from '../../../src/domain/platform/ports/IObservability';

describe('Observability Platform', () => {
    describe('Logging', () => {
        it('should format logs as JSON', () => {
            const formatter = new JsonLogFormatter();
            const log = formatter.format({
                timestamp: new Date('2026-08-03T12:00:00.000Z'),
                severity: LogSeverity.INFO,
                message: 'Test message',
                component: 'TestComponent',
                eventType: 'TEST_EVENT',
                context: { correlationId: '123' }
            });
            const parsed = JSON.parse(log as string);
            expect(parsed.message).toBe('Test message');
            expect(parsed.correlationId).toBe('123');
        });

        it('should correlate logs within context', () => {
            const provider = new CorrelationIdProvider();
            provider.runWithContext({ correlationId: '456' }, () => {
                expect(provider.get()).toBe('456');
            });
        });
    });

    describe('Metrics', () => {
        it('should collect counters, gauges and histograms', async () => {
            const registry = new MetricsRegistry();
            const counter = registry.createCounter('requests', 'Total requests');
            const gauge = registry.createGauge('active_users', 'Active users');
            const hist = registry.createHistogram('request_duration', 'Duration');

            counter.inc();
            counter.inc();
            gauge.set(5);
            hist.observe(100);
            hist.observe(200);

            const metrics = await registry.collect();
            expect(metrics.counters['requests']).toBe(2);
            expect(metrics.gauges['active_users']).toBe(5);
            expect(metrics.histograms['request_duration'].avg).toBe(150);
        });
    });

    describe('Health Monitoring', () => {
        it('should aggregate health status', async () => {
            const registry = new HealthCheckRegistry();
            const aggregator = new HealthStatusAggregator();
            const monitor = new HealthMonitor(registry, aggregator);

            registry.register({
                checkHealth: async () => ({ status: HealthStatus.UP, component: 'DB', timestamp: new Date() })
            });

            registry.register({
                checkHealth: async () => ({ status: HealthStatus.DEGRADED, component: 'Cache', timestamp: new Date(), message: 'Slow response' })
            });

            const result = await monitor.checkAll();
            expect(result.status).toBe(HealthStatus.DEGRADED);
            expect(result.message).toContain('Cache: Slow response');
        });
    });

    describe('Tracing', () => {
        it('should create nested spans with parent-child relation', () => {
            let exportedSpan: any = null;
            const manager = new TraceManager({
                export: async (span) => { exportedSpan = span; }
            });

            const parentSpan = manager.startSpan('Parent');
            const childSpan = manager.startSpan('Child', parentSpan.getContext());
            
            expect(childSpan.getContext().traceId).toBe(parentSpan.getContext().traceId);
            expect(childSpan.getContext().parentSpanId).toBe(parentSpan.getContext().spanId);
            
            childSpan.end();
            expect(exportedSpan).toBe(childSpan);
        });
    });

    describe('Audit', () => {
        it('should store and filter audit records', async () => {
            const backend = new InMemoryAuditBackend();
            await backend.append({
                id: '1',
                timestamp: new Date('2026-08-03T10:00:00Z'),
                organizationId: 'org1',
                userId: 'user1',
                action: 'CREATE',
                resource: 'Document',
                details: {}
            });
            await backend.append({
                id: '2',
                timestamp: new Date('2026-08-03T11:00:00Z'),
                organizationId: 'org1',
                userId: 'user2',
                action: 'DELETE',
                resource: 'Document',
                details: {}
            });

            const results = await backend.search({ userId: 'user1' });
            expect(results.length).toBe(1);
            expect(results[0].id).toBe('1');
        });
    });

    describe('Alerts', () => {
        it('should dispatch alert if condition is met', async () => {
            let dispatchedAlert: IAlertHistory | null = null;
            const engine = new AlertEngine({
                dispatch: async (alert) => { dispatchedAlert = alert; }
            });

            engine.addRule({
                id: 'rule1',
                name: 'High CPU',
                condition: 'cpu > 90',
                severity: AlertSeverity.CRITICAL
            });

            await engine.evaluateCondition('rule1', true, 'CPU is at 95%');
            expect(dispatchedAlert).not.toBeNull();
            expect(dispatchedAlert?.ruleId).toBe('rule1');
            expect(dispatchedAlert?.severity).toBe(AlertSeverity.CRITICAL);
        });
    });

    describe('Diagnostics', () => {
        it('should record slow requests', async () => {
            const detector = new SlowRequestDetector(1000);
            detector.recordRequest('/api/fast', 500);
            detector.recordRequest('/api/slow', 1500);

            const slow = await detector.getSlowRequests();
            expect(slow.length).toBe(1);
            expect(slow[0].path).toBe('/api/slow');
        });
    });

    describe('Runtime Dashboard', () => {
        it('should return system status', async () => {
            const dashboard = new RuntimeDashboard({
                activeWorkersCount: async () => 5,
                queueSize: async () => 10,
                schedulerStatus: async () => 'RUNNING',
                cacheStatus: async () => 'CONNECTED',
                healthMonitor: {
                    checkAll: async () => ({ status: HealthStatus.UP, component: 'System', timestamp: new Date() })
                }
            });

            const status = await dashboard.getStatus();
            expect(status.activeWorkers).toBe(5);
            expect(status.queueSize).toBe(10);
            expect(status.healthSummary).toBe(HealthStatus.UP);
        });
    });
});
