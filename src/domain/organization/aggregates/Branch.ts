import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { BranchId } from '../../shared/valueobjects/BranchId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { BranchCode } from '../../shared/valueobjects/BranchCode';
import { BranchProfile, BranchSettings, BranchStatus, BranchType } from '../types/BranchTypes';
import { ValidationError } from '../../shared/errors/ValidationError';
import { BranchCreatedEvent } from '../events/BranchCreatedEvent';
import { BranchUpdatedEvent } from '../events/BranchUpdatedEvent';
import { BranchActivatedEvent } from '../events/BranchActivatedEvent';
import { BranchDeactivatedEvent } from '../events/BranchDeactivatedEvent';
import { BranchArchivedEvent } from '../events/BranchArchivedEvent';

export class Branch extends AggregateRoot<BranchId> {
    private readonly _organizationId: OrganizationId;
    private readonly _code: BranchCode;
    private _profile: BranchProfile;
    private _settings: BranchSettings;
    private _status: BranchStatus;

    private constructor(
        id: BranchId, 
        organizationId: OrganizationId, 
        code: BranchCode, 
        profile: BranchProfile,
        settings: BranchSettings,
        status: BranchStatus
    ) {
        super(id);
        this._organizationId = organizationId;
        this._code = code;
        this._profile = profile;
        this._settings = settings;
        this._status = status;
    }

    public static create(
        id: BranchId, 
        organizationId: OrganizationId, 
        code: BranchCode, 
        profile: BranchProfile,
        settings?: BranchSettings
    ): Branch {
        const branchSettings = settings || { type: BranchType.LOCAL };
        const branch = new Branch(id, organizationId, code, profile, branchSettings, BranchStatus.ACTIVE);
        branch.addDomainEvent(new BranchCreatedEvent(id, organizationId, code));
        return branch;
    }

    public static load(
        id: BranchId,
        organizationId: OrganizationId,
        code: BranchCode,
        profile: BranchProfile,
        settings: BranchSettings,
        status: BranchStatus
    ): Branch {
        return new Branch(id, organizationId, code, profile, settings, status);
    }

    public updateProfile(profile: BranchProfile): void {
        this.verifyNotArchived();
        this._profile = profile;
        this.addDomainEvent(new BranchUpdatedEvent(this.id));
    }

    public updateSettings(settings: BranchSettings): void {
        this.verifyNotArchived();
        this._settings = settings;
        this.addDomainEvent(new BranchUpdatedEvent(this.id));
    }

    public activate(): void {
        this.verifyNotArchived();
        if (this._status === BranchStatus.ACTIVE) {
            throw new ValidationError('Branch is already active');
        }
        this._status = BranchStatus.ACTIVE;
        this.addDomainEvent(new BranchActivatedEvent(this.id));
    }

    public deactivate(): void {
        this.verifyNotArchived();
        if (this._status === BranchStatus.INACTIVE) {
            throw new ValidationError('Branch is already inactive');
        }
        this._status = BranchStatus.INACTIVE;
        this.addDomainEvent(new BranchDeactivatedEvent(this.id));
    }

    public archive(): void {
        if (this._status === BranchStatus.ARCHIVED) {
            throw new ValidationError('Branch is already archived');
        }
        this._status = BranchStatus.ARCHIVED;
        this.addDomainEvent(new BranchArchivedEvent(this.id));
    }

    private verifyNotArchived(): void {
        if (this._status === BranchStatus.ARCHIVED) {
            throw new ValidationError('Operation not allowed on an archived branch');
        }
    }

    public get organizationId(): OrganizationId { return this._organizationId; }
    public get code(): BranchCode { return this._code; }
    public get profile(): BranchProfile { return this._profile; }
    public get settings(): BranchSettings { return this._settings; }
    public get status(): BranchStatus { return this._status; }
}
