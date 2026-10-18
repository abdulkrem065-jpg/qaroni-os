# QEOS IAM AUTHENTICATION ENGINE REPORT

## 1. Authentication Flow
The Authentication Engine securely orchestrates the identity lifecycle:
- **Login**: Evaluates `email` to resolve the identity, verifies organizational and active status via `AuthenticationVerifier`, and checks the plain password hash using `CredentialValidator`. Upon success, it issues a Session and utilizes factory abstractions to issue `accessToken` and `refreshToken` strings, followed by publishing an `AuthenticationSucceeded` domain event.
- **Logout**: Directs `SessionTerminationService` to retrieve and explicitly revoke the active session entity in the persistence layer. Emits `SessionTerminated`.
- **Refresh Session**: Evaluates the `sessionId` validity using `RefreshTokenService`. If it is active and unexpired, it revokes the old session, provisions a new session, re-verifies the user/organization state constraints, and issues new tokens via the factories.

## 2. Dependency Graph
- The Authentication Engine sits purely within the **Application Layer**.
- It depends *inward* on **Domain Repositories**, **Domain Aggregates/Entities**, and **Domain Events**.
- It exposes *interfaces* (`AccessTokenFactory`, `RefreshTokenFactory`, `PasswordVerificationService`, `IOrganizationVerificationService`, `IBranchVerificationService`) outward to be satisfied by the Infrastructure layer (e.g. JWT and Bcrypt implementations).
- Zero dependencies on HTTP, Express, or API frameworks.

## 3. Session Lifecycle
- **Creation**: `SessionCreationService` generates cryptographically secure `UUID` identifiers, calculating `expiresAt` directly based on a 7-day TTL parameter. 
- **Termination**: `SessionTerminationService` retrieves the `Session` domain entity and invokes the internal `revoke()` method, storing the mutated entity back via the repository. 
- **Invalidation on Refresh**: Refresh logic automatically revokes the old valid session and generates a fresh session identifier, enforcing session rotation.

## 4. Token Abstraction
- The engine operates purely on string-based tokens and `AuthenticationContext` DTOs.
- `AccessTokenFactory` and `RefreshTokenFactory` interfaces are defined without concrete logic, completely decoupling the engine from JWT generation, signing secrets, or encryption algorithms.

## 5. Security Verification
The `AuthenticationVerifier` and `CredentialValidator` jointly enforce a strict pipeline of multi-factor checks before authentication succeeds:
- **User Validation**: Ensure the User aggregate exists, `isActivated == true`, `isDeleted == false`, and `isSuspended == false`.
- **Tenant Validation**: Calls outward interfaces to verify the user's `Organization` is fully active and not suspended. If the user is scoped to a `Branch`, the specific branch is also verified.
- **Credential Validation**: Fetches the `Credential` entity, verifies `isActive == true`, and delegates hash comparison to the `PasswordVerificationService` abstraction.

## 6. Readiness for Authorization Engine
- The Authentication layer is fully complete and structurally isolated. 
- It establishes identity reliably and issues secure tokens containing verifiable context (`userId`, `organizationId`, `branchId`, `sessionId`).
- The system is now fully prepared for the **Authorization Engine (RBAC)** implementation, which will intercept requests downstream, interpret the identities established here, and evaluate permissions to allow or deny specific domain actions.

**Status: COMPLETE. AWAITING HUMAN AUTHORIZATION.**
