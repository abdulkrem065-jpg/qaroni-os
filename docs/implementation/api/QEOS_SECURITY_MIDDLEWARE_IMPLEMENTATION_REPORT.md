# QEOS SECURITY MIDDLEWARE IMPLEMENTATION REPORT

## 1. Middleware Chain
The Security Middleware chain orchestrates identity and permission checking in a unidirectional pipeline before requests reach business controllers:
`SecurityContextMiddleware` -> `AuthenticationMiddleware` -> `OrganizationResolutionMiddleware` -> `BranchResolutionMiddleware` -> `TenantIsolationMiddleware` -> `AuthorizationMiddleware` -> `PermissionGuard`

## 2. Authentication Integration
The `AuthenticationMiddleware` delegates identity verification to an abstract `ITokenValidator` provided by the Authentication Engine. It utilizes the `RequestIdentityResolver` to extract credentials (e.g., Bearer tokens) without hardcoding JWT or encryption algorithms in the API layer. Once validated, the identity payload is mutated onto a typesafe `req.securityContext`.

## 3. Authorization Integration
The `PermissionGuard` bridges the HTTP layer with the IAM Authorization Engine. By dynamically accepting `action` and `resource` parameters, it builds an `AuthorizationContext` from the active request identity and invokes `AuthorizationService.authorize()`. It guarantees that all authorization decisions are handled cleanly inside the Domain/Application boundary rather than inside Express routes.

## 4. Request Context Lifecycle
The `req.securityContext` object lives exclusively per-request. It starts empty in `SecurityContextMiddleware`, gets populated in `AuthenticationMiddleware`, is strictly enforced in Tenant and Branch resolution phases, and gets consumed by `PermissionGuard`.

## 5. Error Mapping
The middleware strictly maps IAM Authorization Engine states to standardized HTTP codes via `AuthFailureHandler`:
- `401 Unauthorized`: Missing or invalid tokens (`RequestIdentityResolver` or `AuthenticationMiddleware` failures).
- `403 Forbidden`: `MISSING_PERMISSION`, general authorization denial, or `Cross-organization access violation` (caught by `TenantIsolationMiddleware`).
- `419 Session Expired`: Explicit session expiration tokens.
- `423 User Disabled`: Maps from `AuthorizationDecisionType.DISABLED_USER`.
- `424 Organization Disabled`: Maps from `AuthorizationDecisionType.DISABLED_ORGANIZATION` or missing org contexts.
- `425 Branch Disabled`: Maps from `AuthorizationDecisionType.DISABLED_BRANCH`.

## 6. Event Emission
The middleware actively emits the following domain/security events to the `IEventBus` to power audit logging and telemetry:
- `RequestAuthenticated`: Fired upon successful token validation.
- `RequestRejected`: Fired upon missing or malformed credentials.
- `SecurityViolationDetected`: Fired during multi-tenant boundary breaches (`TenantIsolationMiddleware`).
- `AuthorizationChecked`: Fired after a successful authorization pass through `PermissionGuard`.

## 7. Security Verification
- **Tenant Isolation**: Explicitly enforced. If a REST parameter specifies an `organizationId`, the `TenantIsolationMiddleware` ensures it strictly matches the identity's `organizationId`.
- **Zero Business Logic**: The pipeline relies purely on abstractions and domain logic. It executes zero database queries, avoids Supabase SDK interactions, and does not parse raw passwords.

## 8. Readiness for IAM API Endpoints
- The `SecurityPipeline` class is constructed and exposes `.buildSecureRoute()` and `.buildAuthenticatedRoute()` factories.
- The system is now completely ready for the concrete **IAM API Endpoints** phase, which will bind these pipelines to actual Express routers for `/auth/login`, `/auth/refresh`, and administrative operations.

**Status: COMPLETE. AWAITING HUMAN AUTHORIZATION.**
