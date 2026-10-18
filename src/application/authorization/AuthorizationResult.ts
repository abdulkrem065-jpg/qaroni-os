import { AuthorizationDecision } from './AuthorizationDecision';

export class AuthorizationResult {
    constructor(
        public readonly decision: AuthorizationDecision,
        public readonly requiredAction: string,
        public readonly requiredResource: string
    ) {}

    public get isAllowed(): boolean {
        return this.decision.isGranted;
    }
}
