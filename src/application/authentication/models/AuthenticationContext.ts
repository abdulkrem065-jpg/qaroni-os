export class AuthenticationContext {
    constructor(
        public readonly userId: string,
        public readonly organizationId: string,
        public readonly branchId?: string,
        public readonly sessionId?: string
    ) {}
}
