export class AuthorizationContext {
    constructor(
        public readonly userId: string,
        public readonly organizationId: string,
        public readonly branchId?: string,
        public readonly attributes: Record<string, any> = {}
    ) {}
}
