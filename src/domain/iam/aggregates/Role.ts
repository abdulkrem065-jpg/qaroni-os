import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { RoleId } from '../valueobjects/RoleId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { PermissionId } from '../valueobjects/PermissionId';
import { ValidationError } from '../../shared/errors/ValidationError';
import { RoleCreatedEvent } from '../events/RoleCreatedEvent';
import { RolePermissionGrantedEvent } from '../events/RolePermissionGrantedEvent';
import { RolePermissionRevokedEvent } from '../events/RolePermissionRevokedEvent';

export class Role extends AggregateRoot<RoleId> {
    private _organizationId: OrganizationId;
    private _name: string;
    private _description: string;
    private _permissionIds: PermissionId[];

    private constructor(id: RoleId, organizationId: OrganizationId, name: string, permissionIds: PermissionId[], description: string = '') {
        super(id);
        this._organizationId = organizationId;
        this._name = name;
        this._description = description;
        this._permissionIds = [...permissionIds];
    }

    public static create(id: RoleId, organizationId: OrganizationId, name: string, description: string = ''): Role {
        if (!name || name.trim().length === 0) {
            throw new ValidationError('Role name cannot be empty');
        }
        const role = new Role(id, organizationId, name.trim(), [], description);
        role.addDomainEvent(new RoleCreatedEvent(id, organizationId, name.trim()));
        return role;
    }

    public grantPermission(permissionId: PermissionId): void {
        if (this._permissionIds.some(p => p.equals(permissionId))) {
            throw new ValidationError('Role already has this permission granted');
        }
        this._permissionIds.push(permissionId);
        this.addDomainEvent(new RolePermissionGrantedEvent(this.id, permissionId));
    }

    public revokePermission(permissionId: PermissionId): void {
        const index = this._permissionIds.findIndex(p => p.equals(permissionId));
        if (index === -1) {
            throw new ValidationError('Role does not have this permission granted');
        }
        this._permissionIds.splice(index, 1);
        this.addDomainEvent(new RolePermissionRevokedEvent(this.id, permissionId));
    }

    public get organizationId(): OrganizationId { return this._organizationId; }
    public get name(): string { return this._name; }
    public get description(): string { return this._description; }
    public get permissionIds(): ReadonlyArray<PermissionId> { return this._permissionIds; }
}
