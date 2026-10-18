import { IBranchRepository } from '../../../domain/organization/repositories/IBranchRepository';
import { Branch } from '../../../domain/organization/aggregates/Branch';
import { BranchId } from '../../../domain/shared/valueobjects/BranchId';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { BranchCode } from '../../../domain/shared/valueobjects/BranchCode';
import { BranchName } from '../../../domain/shared/valueobjects/BranchName';
import { BranchAddress } from '../../../domain/shared/valueobjects/BranchAddress';
import { BranchPhone } from '../../../domain/shared/valueobjects/BranchPhone';
import { BranchEmail } from '../../../domain/shared/valueobjects/BranchEmail';
import { BranchProfile, BranchSettings, BranchType } from '../../../domain/organization/types/BranchTypes';
import { ApplicationError } from '../../errors/ApplicationError';
import { IEventBus } from '../../ports/IEventBus';

export class CreateBranchUseCase {
    constructor(private readonly repository: IBranchRepository, private readonly eventBus: IEventBus) {}
    
    async execute(
        id: string, 
        organizationId: string, 
        code: string, 
        name: string, 
        address: { street: string; city: string; state: string; country: string; postalCode: string },
        phone?: string,
        email?: string,
        settings?: { type: string; operatingHours?: string; timezone?: string }
    ): Promise<void> {
        const branchId = new BranchId(id);
        const orgId = new OrganizationId(organizationId);
        const branchCode = BranchCode.create(code);

        if (await this.repository.exists(branchId)) {
            throw new ApplicationError(`Branch with id ${id} already exists.`);
        }

        const existingCode = await this.repository.findByOrganizationIdAndCode(orgId, branchCode);
        if (existingCode) {
            throw new ApplicationError(`Branch with code ${code} already exists in this organization.`);
        }

        const branchProfile: BranchProfile = {
            name: BranchName.create(name),
            address: BranchAddress.create(address.street, address.city, address.state, address.country, address.postalCode),
            phone: phone ? BranchPhone.create(phone) : undefined,
            email: email ? BranchEmail.create(email) : undefined
        };

        const branchSettings: BranchSettings = settings ? {
            type: settings.type as BranchType || BranchType.LOCAL,
            operatingHours: settings.operatingHours,
            timezone: settings.timezone
        } : { type: BranchType.LOCAL };

        const branch = Branch.create(branchId, orgId, branchCode, branchProfile, branchSettings);
        await this.repository.save(branch);
        await this.eventBus.publishAll(branch.domainEvents);
        branch.clearDomainEvents();
    }
}

export class UpdateBranchUseCase {
    constructor(private readonly repository: IBranchRepository, private readonly eventBus: IEventBus) {}
    
    async execute(
        organizationId: string,
        id: string, 
        profile?: { name?: string; address?: { street: string; city: string; state: string; country: string; postalCode: string }; phone?: string; email?: string },
        settings?: { type?: string; operatingHours?: string; timezone?: string }
    ): Promise<void> {
        const branchId = new BranchId(id);
        const orgId = new OrganizationId(organizationId);
        const branch = await this.repository.findByOrganizationIdAndId(orgId, branchId);
        
        if (!branch) {
            throw new ApplicationError(`Branch with id ${id} not found in this organization.`);
        }

        if (profile) {
            const currentProfile = branch.profile;
            const newProfile: BranchProfile = {
                name: profile.name ? BranchName.create(profile.name) : currentProfile.name,
                address: profile.address ? BranchAddress.create(profile.address.street, profile.address.city, profile.address.state, profile.address.country, profile.address.postalCode) : currentProfile.address,
                phone: profile.phone !== undefined ? (profile.phone ? BranchPhone.create(profile.phone) : undefined) : currentProfile.phone,
                email: profile.email !== undefined ? (profile.email ? BranchEmail.create(profile.email) : undefined) : currentProfile.email
            };
            branch.updateProfile(newProfile);
        }

        if (settings) {
            const currentSettings = branch.settings;
            const newSettings: BranchSettings = {
                type: settings.type ? settings.type as BranchType : currentSettings.type,
                operatingHours: settings.operatingHours !== undefined ? settings.operatingHours : currentSettings.operatingHours,
                timezone: settings.timezone !== undefined ? settings.timezone : currentSettings.timezone
            };
            branch.updateSettings(newSettings);
        }

        await this.repository.save(branch);
        await this.eventBus.publishAll(branch.domainEvents);
        branch.clearDomainEvents();
    }
}

export class ActivateBranchUseCase {
    constructor(private readonly repository: IBranchRepository, private readonly eventBus: IEventBus) {}
    
    async execute(organizationId: string, id: string): Promise<void> {
        const branchId = new BranchId(id);
        const orgId = new OrganizationId(organizationId);
        const branch = await this.repository.findByOrganizationIdAndId(orgId, branchId);
        
        if (!branch) {
            throw new ApplicationError(`Branch with id ${id} not found in this organization.`);
        }

        branch.activate();
        await this.repository.save(branch);
        await this.eventBus.publishAll(branch.domainEvents);
        branch.clearDomainEvents();
    }
}

export class DeactivateBranchUseCase {
    constructor(private readonly repository: IBranchRepository, private readonly eventBus: IEventBus) {}
    
    async execute(organizationId: string, id: string): Promise<void> {
        const branchId = new BranchId(id);
        const orgId = new OrganizationId(organizationId);
        const branch = await this.repository.findByOrganizationIdAndId(orgId, branchId);
        
        if (!branch) {
            throw new ApplicationError(`Branch with id ${id} not found in this organization.`);
        }

        branch.deactivate();
        await this.repository.save(branch);
        await this.eventBus.publishAll(branch.domainEvents);
        branch.clearDomainEvents();
    }
}

export class ArchiveBranchUseCase {
    constructor(private readonly repository: IBranchRepository, private readonly eventBus: IEventBus) {}
    
    async execute(organizationId: string, id: string): Promise<void> {
        const branchId = new BranchId(id);
        const orgId = new OrganizationId(organizationId);
        const branch = await this.repository.findByOrganizationIdAndId(orgId, branchId);
        
        if (!branch) {
            throw new ApplicationError(`Branch with id ${id} not found in this organization.`);
        }

        branch.archive();
        await this.repository.save(branch);
        await this.eventBus.publishAll(branch.domainEvents);
        branch.clearDomainEvents();
    }
}

export class GetBranchUseCase {
    constructor(private readonly repository: IBranchRepository) {}
    
    async execute(organizationId: string, id: string): Promise<Branch | null> {
        const orgId = new OrganizationId(organizationId);
        const branchId = new BranchId(id);
        return this.repository.findByOrganizationIdAndId(orgId, branchId);
    }
}

export class ListBranchesUseCase {
    constructor(private readonly repository: IBranchRepository) {}
    
    async execute(organizationId: string): Promise<Branch[]> {
        const orgId = new OrganizationId(organizationId);
        return this.repository.findAllByOrganizationId(orgId);
    }
}
