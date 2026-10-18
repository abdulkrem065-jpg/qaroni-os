import { PermissionId } from '../value-objects/PermissionId';
import { OrganizationId } from '../value-objects/OrganizationId';

export class Permission {
    constructor(
        public readonly id: PermissionId,
        public readonly organizationId: OrganizationId,
        public readonly name: string,
        public readonly action: string,
        public readonly resource: string
    ) {}
}
