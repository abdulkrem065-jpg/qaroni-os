# QEOS Go-Live Checklist

This checklist tracks the final steps required before deploying QEOS to the production environment. 

## 1. Codebase & Configuration
- [ ] **Mock Replacement:** Remove all stub/mock implementations (e.g., `LocalPasswordInfrastructure` hash mock, Kernel boot hook `null` defaults).
- [ ] **UI Mocks:** Remove UI mock logic (e.g., `staffMock` in `Dashboard.tsx`) and wire entirely to production APIs.
- [ ] **Environment Variables:** Verify `.env` parameters correspond to the `EnvironmentType.PRODUCTION` configuration.
- [ ] **Secrets Integration:** Transition from `LocalSecretProvider` to a robust Vault or Cloud Secret Manager.

## 2. Infrastructure Provisioning
- [ ] **Database Setup:** Provision PostgreSQL instance (Cloud SQL / RDS / Supabase).
- [ ] **Redis Setup:** Provision Redis instance for caching and BullMQ queues.
- [ ] **Database Migrations:** Run Drizzle ORM migrations against the production database instance.
- [ ] **Row Level Security (RLS):** Ensure PostgreSQL multi-tenant constraints/RLS are fully active based on `organizationId`.

## 3. Platform Verification
- [ ] **Observability Verification:** Verify StructuredLogger JSON outputs are being correctly ingested by the log aggregator (e.g., Datadog, ELK).
- [ ] **Metrics Validation:** Validate that `MetricsRegistry` histograms and gauges are shipping correctly.
- [ ] **Tracing Validation:** Confirm OpenTelemetry/Jaeger spans are generated successfully for queue and HTTP requests.
- [ ] **Queue Workers:** Ensure BullMQ worker processes are running and successfully executing jobs.
- [ ] **Scheduler Verification:** Verify `SchedulerEngine` triggers periodic tasks precisely as scheduled.

## 4. Security & Compliance
- [ ] **Audit Logs:** Ensure the `IImmutableAuditStream` is securely pushing events to cold storage.
- [ ] **Secret Rotation:** Verify that secret rotation policies and expiration checks are active.
- [ ] **JWT Configuration:** Ensure robust JWT signing secrets and optimal token expiration policies are in place.

## 5. Deployment
- [ ] **Containerization:** Finalize Docker images and push to the container registry.
- [ ] **Orchestration:** Deploy Kubernetes manifests or Cloud Run configurations.
- [ ] **Health Checks:** Confirm load balancers are passing `/health` checks via the `HealthMonitor`.
- [ ] **Smoke Testing:** Execute final staging end-to-end (E2E) tests.

## 6. Sign-Off
- [ ] Chief Architect Approval.
- [ ] Security Officer Approval.
- [ ] Operations Lead Approval.

**System Status:** Awaiting pre-flight clearance.
