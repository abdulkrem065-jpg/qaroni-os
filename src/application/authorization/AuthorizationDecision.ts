export enum AuthorizationDecisionType {
    ALLOW = 'Allow',
    DENY = 'Deny',
    NOT_FOUND = 'NotFound',
    DISABLED_USER = 'DisabledUser',
    DISABLED_ORGANIZATION = 'DisabledOrganization',
    DISABLED_BRANCH = 'DisabledBranch',
    MISSING_PERMISSION = 'MissingPermission'
}

export class AuthorizationDecision {
    constructor(
        public readonly type: AuthorizationDecisionType,
        public readonly isGranted: boolean,
        public readonly reason?: string
    ) {}

    public static allow(): AuthorizationDecision {
        return new AuthorizationDecision(AuthorizationDecisionType.ALLOW, true);
    }

    public static deny(type: AuthorizationDecisionType, reason?: string): AuthorizationDecision {
        return new AuthorizationDecision(type, false, reason);
    }
}
