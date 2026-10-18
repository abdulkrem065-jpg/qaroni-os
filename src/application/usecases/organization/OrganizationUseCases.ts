import { IOrganizationRepository } from '../../../domain/organization/repositories/IOrganizationRepository';
import { Organization } from '../../../domain/organization/aggregates/Organization';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { TaxId } from '../../../domain/shared/valueobjects/TaxId';
import { Timezone } from '../../../domain/shared/valueobjects/Timezone';
import { Currency } from '../../../domain/shared/valueobjects/Currency';
import { ApplicationError } from '../../errors/ApplicationError';
import { IEventBus } from '../../ports/IEventBus';

export class CreateOrganizationUseCase {
    constructor(
        private readonly repository: IOrganizationRepository,
        private readonly eventBus: IEventBus
    ) {}

    async execute(id: string, name: string): Promise<void> {
        const orgId = new OrganizationId(id);
        if (await this.repository.exists(orgId)) {
            throw new ApplicationError(`Organization with id ${id} already exists.`);
        }
        const organization = Organization.create(orgId, name);
        await this.repository.save(organization);
        await this.eventBus.publishAll(organization.domainEvents);
        organization.clearDomainEvents();
    }
}

export class UpdateOrganizationSettingsUseCase {
    constructor(
        private readonly repository: IOrganizationRepository,
        private readonly eventBus: IEventBus
    ) {}

    async execute(id: string, taxId?: string, timezone?: string, currency?: string): Promise<void> {
        const orgId = new OrganizationId(id);
        const organization = await this.repository.findById(orgId);
        
        if (!organization) {
            throw new ApplicationError(`Organization with id ${id} not found.`);
        }

        const tId = taxId ? TaxId.create(taxId) : undefined;
        const tz = timezone ? Timezone.create(timezone) : undefined;
        const curr = currency ? new Currency(currency) : undefined;

        organization.updateSettings(tId, tz, curr);

        await this.repository.save(organization);
        await this.eventBus.publishAll(organization.domainEvents);
        organization.clearDomainEvents();
    }
}

export class DeactivateOrganizationUseCase {
    constructor(
        private readonly repository: IOrganizationRepository,
        private readonly eventBus: IEventBus
    ) {}

    async execute(id: string): Promise<void> {
        const orgId = new OrganizationId(id);
        const organization = await this.repository.findById(orgId);
        
        if (!organization) {
            throw new ApplicationError(`Organization with id ${id} not found.`);
        }
        
        organization.deactivate();
        await this.repository.save(organization);
        await this.eventBus.publishAll(organization.domainEvents);
        organization.clearDomainEvents();
    }
}

export class DeleteOrganizationUseCase {
    constructor(
        private readonly repository: IOrganizationRepository,
        private readonly eventBus: IEventBus
    ) {}

    async execute(id: string): Promise<void> {
        const orgId = new OrganizationId(id);
        if (!(await this.repository.exists(orgId))) {
            throw new ApplicationError(`Organization with id ${id} not found.`);
        }
        await this.repository.delete(orgId);
        // Deletion usually doesn't emit domain events from the aggregate directly since the aggregate is destroyed, 
        // but we might want an OrganizationDeletedEvent. For now, skipping.
    }
}

export class GetOrganizationByIdUseCase {
    constructor(private readonly repository: IOrganizationRepository) {}

    async execute(id: string): Promise<Organization | null> {
        return this.repository.findById(new OrganizationId(id));
    }
}

export class GetAllOrganizationsUseCase {
    constructor(private readonly repository: IOrganizationRepository) {}

    async execute(): Promise<Organization[]> {
        return this.repository.findAll();
    }
}
