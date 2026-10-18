import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { StaffId } from '../../shared/valueobjects/StaffId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { BranchId } from '../../shared/valueobjects/BranchId';
import { RoleId } from '../../iam/value-objects/RoleId';
import { StaffProfile, StaffEmployment, EmploymentStatus } from '../types/StaffTypes';
import { ValidationError } from '../../shared/errors/ValidationError';
import { 
    StaffCreatedEvent, 
    StaffUpdatedEvent, 
    StaffActivatedEvent, 
    StaffSuspendedEvent, 
    StaffArchivedEvent, 
    StaffTransferredEvent,
    StaffRoleAssignedEvent,
    StaffRoleRemovedEvent
} from '../events/StaffEvents';

export class Staff extends AggregateRoot<StaffId> {
    private readonly _organizationId: OrganizationId;
    private _branchId: BranchId;
    private _profile: StaffProfile;
    private _employment: StaffEmployment;
    private _status: EmploymentStatus;
    private _roles: Set<string>;

    private constructor(
        id: StaffId,
        organizationId: OrganizationId,
        branchId: BranchId,
        profile: StaffProfile,
        employment: StaffEmployment,
        status: EmploymentStatus,
        roles: Set<string>
    ) {
        super(id);
        this._organizationId = organizationId;
        this._branchId = branchId;
        this._profile = profile;
        this._employment = employment;
        this._status = status;
        this._roles = roles;
    }

    public static create(
        id: StaffId,
        organizationId: OrganizationId,
        branchId: BranchId,
        profile: StaffProfile,
        employment: StaffEmployment
    ): Staff {
        if (!profile.firstName || !profile.lastName || !profile.email) {
            throw new ValidationError('Staff profile must include firstName, lastName, and email');
        }
        const staff = new Staff(id, organizationId, branchId, profile, employment, EmploymentStatus.ACTIVE, new Set());
        staff.addDomainEvent(new StaffCreatedEvent(id, organizationId, branchId));
        return staff;
    }

    public static load(
        id: StaffId,
        organizationId: OrganizationId,
        branchId: BranchId,
        profile: StaffProfile,
        employment: StaffEmployment,
        status: EmploymentStatus,
        roles: string[]
    ): Staff {
        return new Staff(id, organizationId, branchId, profile, employment, status, new Set(roles));
    }

    public updateProfile(profile: StaffProfile): void {
        this.verifyNotArchived();
        if (!profile.firstName || !profile.lastName || !profile.email) {
            throw new ValidationError('Staff profile must include firstName, lastName, and email');
        }
        this._profile = profile;
        this.addDomainEvent(new StaffUpdatedEvent(this.id));
    }

    public updateEmployment(employment: StaffEmployment): void {
        this.verifyNotArchived();
        this._employment = employment;
        this.addDomainEvent(new StaffUpdatedEvent(this.id));
    }

    public activate(): void {
        this.verifyNotArchived();
        if (this._status === EmploymentStatus.ACTIVE) {
            throw new ValidationError('Staff is already active');
        }
        this._status = EmploymentStatus.ACTIVE;
        this.addDomainEvent(new StaffActivatedEvent(this.id));
    }

    public suspend(): void {
        this.verifyNotArchived();
        if (this._status === EmploymentStatus.SUSPENDED) {
            throw new ValidationError('Staff is already suspended');
        }
        this._status = EmploymentStatus.SUSPENDED;
        this.addDomainEvent(new StaffSuspendedEvent(this.id));
    }

    public archive(): void {
        if (this._status === EmploymentStatus.ARCHIVED) {
            throw new ValidationError('Staff is already archived');
        }
        this._status = EmploymentStatus.ARCHIVED;
        this.addDomainEvent(new StaffArchivedEvent(this.id));
    }

    public transfer(newBranchId: BranchId): void {
        this.verifyNotArchived();
        if (this._branchId.value === newBranchId.value) {
            throw new ValidationError('Staff is already assigned to this branch');
        }
        this._branchId = newBranchId;
        this.addDomainEvent(new StaffTransferredEvent(this.id, newBranchId));
    }

    public assignRole(roleId: RoleId): void {
        this.verifyNotArchived();
        if (this._roles.has(roleId.value)) {
            throw new ValidationError('Staff already has this role');
        }
        this._roles.add(roleId.value);
        this.addDomainEvent(new StaffRoleAssignedEvent(this.id, roleId));
    }

    public removeRole(roleId: RoleId): void {
        this.verifyNotArchived();
        if (!this._roles.has(roleId.value)) {
            throw new ValidationError('Staff does not have this role');
        }
        this._roles.delete(roleId.value);
        this.addDomainEvent(new StaffRoleRemovedEvent(this.id, roleId));
    }

    private verifyNotArchived(): void {
        if (this._status === EmploymentStatus.ARCHIVED) {
            throw new ValidationError('Operation not allowed on archived staff');
        }
    }

    public get organizationId(): OrganizationId { return this._organizationId; }
    public get branchId(): BranchId { return this._branchId; }
    public get profile(): StaffProfile { return this._profile; }
    public get employment(): StaffEmployment { return this._employment; }
    public get status(): EmploymentStatus { return this._status; }
    public get roles(): ReadonlyArray<string> { return Array.from(this._roles); }
}
