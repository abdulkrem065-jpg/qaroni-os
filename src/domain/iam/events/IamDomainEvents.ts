export interface DomainEvent {
    readonly occurredOn: Date;
}

export class UserCreated implements DomainEvent {
    public readonly occurredOn: Date = new Date();
    constructor(
        public readonly userId: string,
        public readonly organizationId: string,
        public readonly email: string,
        public readonly branchId?: string
    ) {}
}

export class UserActivated implements DomainEvent {
    public readonly occurredOn: Date = new Date();
    constructor(public readonly userId: string) {}
}

export class UserSuspended implements DomainEvent {
    public readonly occurredOn: Date = new Date();
    constructor(public readonly userId: string, public readonly reason: string) {}
}

export class UserDeleted implements DomainEvent {
    public readonly occurredOn: Date = new Date();
    constructor(public readonly userId: string) {}
}

export class RoleAssigned implements DomainEvent {
    public readonly occurredOn: Date = new Date();
    constructor(public readonly userId: string, public readonly roleId: string) {}
}

export class RoleRevoked implements DomainEvent {
    public readonly occurredOn: Date = new Date();
    constructor(public readonly userId: string, public readonly roleId: string) {}
}

export class PermissionGranted implements DomainEvent {
    public readonly occurredOn: Date = new Date();
    constructor(public readonly roleId: string, public readonly permissionId: string) {}
}

export class PermissionRevoked implements DomainEvent {
    public readonly occurredOn: Date = new Date();
    constructor(public readonly roleId: string, public readonly permissionId: string) {}
}

export class CredentialChanged implements DomainEvent {
    public readonly occurredOn: Date = new Date();
    constructor(public readonly credentialId: string, public readonly userId: string) {}
}

export class AuthenticationSucceeded implements DomainEvent {
    public readonly occurredOn: Date = new Date();
    constructor(public readonly userId: string, public readonly organizationId: string) {}
}

export class AuthenticationFailed implements DomainEvent {
    public readonly occurredOn: Date = new Date();
    constructor(public readonly email: string, public readonly reason: string) {}
}

export class SessionCreated implements DomainEvent {
    public readonly occurredOn: Date = new Date();
    constructor(public readonly sessionId: string, public readonly userId: string) {}
}

export class SessionTerminated implements DomainEvent {
    public readonly occurredOn: Date = new Date();
    constructor(public readonly sessionId: string) {}
}

export class RefreshSucceeded implements DomainEvent {
    public readonly occurredOn: Date = new Date();
    constructor(public readonly oldSessionId: string, public readonly newSessionId: string) {}
}

export class AuthorizationSucceeded implements DomainEvent {
    public readonly occurredOn: Date = new Date();
    constructor(public readonly userId: string, public readonly action: string, public readonly resource: string) {}
}

export class AuthorizationDenied implements DomainEvent {
    public readonly occurredOn: Date = new Date();
    constructor(public readonly userId: string, public readonly action: string, public readonly resource: string, public readonly reason: string) {}
}

export class PermissionResolved implements DomainEvent {
    public readonly occurredOn: Date = new Date();
    constructor(public readonly userId: string, public readonly permissionsCount: number) {}
}

export class PolicyEvaluated implements DomainEvent {
    public readonly occurredOn: Date = new Date();
    constructor(public readonly policyName: string, public readonly result: boolean) {}
}

export class RequestAuthenticated implements DomainEvent {
    public readonly occurredOn: Date = new Date();
    constructor(public readonly userId: string, public readonly path: string) {}
}

export class RequestRejected implements DomainEvent {
    public readonly occurredOn: Date = new Date();
    constructor(public readonly reason: string, public readonly path: string) {}
}

export class AuthorizationChecked implements DomainEvent {
    public readonly occurredOn: Date = new Date();
    constructor(public readonly userId: string, public readonly action: string, public readonly resource: string) {}
}

export class SecurityViolationDetected implements DomainEvent {
    public readonly occurredOn: Date = new Date();
    constructor(public readonly violationType: string, public readonly contextInfo: string) {}
}
