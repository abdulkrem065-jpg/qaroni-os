# QEOS IAM AUTHORIZATION ENGINE REPORT

## 1. Authorization Architecture
The Authorization Engine evaluates "what" an authenticated identity is permitted to do. It exists completely isolated within the Application layer (`src/application/authorization/`). The architecture utilizes an orchestrator (`AuthorizationService`) which pipelines inputs through domain verification, permission evaluation, and policy application, outputting a formalized `AuthorizationResult`.

## 2. Permission Evaluation Algorithm
The core evaluation flow in `AuthorizationService.authorize()`:
1. **Identity & Tenancy Guard**: Validate that the user, organization, and branch are all active.
2. **Permission Discovery**: Fetch user roles and aggregate all granted permissions via `PermissionEvaluator`.
3. **Explicit Evaluation**: Pass the effective permissions to `EffectivePermissionCalculator` to check if `action` and `resource` match (including wildcard `*` support).
4. **Policy Enforcement**: Apply any provided dynamic `AuthorizationPolicy` instances (enabling ABAC/rules-based evaluation).
5. **Decision Synthesis**: Emit domain events (`AuthorizationSucceeded` / `AuthorizationDenied`) and return a structured `AuthorizationResult`.

## 3. Role Resolution Strategy
`RoleEvaluator` iterates through the `User.assignedRoles` IDs and sequentially delegates to the `IRoleRepository` to hydrate the `Role` aggregates for the given user, effectively decoupling the user context from their complex role assignments and ensuring real-time role fetches.

## 4. Effective Permission Calculation
The engine utilizes a pipeline (`RoleEvaluator` -> `PermissionResolver` -> `EffectivePermissionCalculator`) to determine what actions are available.
- `PermissionResolver` guarantees that no duplicate permissions are loaded, deduplicating them efficiently via a map.
- `EffectivePermissionCalculator` takes the resolved set and establishes presence matching. It currently supports a pure additive RBAC model but is strategically encapsulated to absorb hierarchical permissions, explicit Deny overrides, or constraints in future iterations.

## 5. Decision Model
Decisions are explicitly modeled via `AuthorizationDecisionType` mapping out clear states for denial reason tracking (e.g. `DISABLED_USER`, `DISABLED_ORGANIZATION`, `MISSING_PERMISSION`, `DENY`). These explicitly defined boundaries enable high observability into access failures without conflating application logic.

## 6. Dependency Verification
- **Outward Only**: Dependencies are fully directed outward towards Domain Repositories (`IUserRepository`, `IPermissionRepository`, `IRoleRepository`) and Infrastructure Verification abstractions.
- **Purely Decoupled**: There is zero HTTP or Middleware logic embedded.

## 7. Clean Architecture Compliance
- **Entities & Events**: Successfully leverages standard Aggregates and triggers Domain Events (`AuthorizationSucceeded`, `AuthorizationDenied`, `PermissionResolved`, `PolicyEvaluated`) via an injected `IEventBus`.
- **Framework Agnostic**: The system does not know about Express, routing paths, or JWT structures.

## 8. Readiness for Security Middleware
- The Authentication and Authorization Engines are now completely constructed.
- The system is fully ready for the **Security Middleware** phase, where concrete HTTP framework artifacts (like Express middleware) will consume the Auth Engine and RBAC services to protect active application routes securely.

**Status: COMPLETE. AWAITING HUMAN AUTHORIZATION.**
