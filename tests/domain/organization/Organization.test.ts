import { describe, it, expect } from 'vitest';
import { Organization } from '../../../src/domain/organization/aggregates/Organization';
import { OrganizationId } from '../../../src/domain/shared/valueobjects/OrganizationId';
import { TaxId } from '../../../src/domain/shared/valueobjects/TaxId';
import { Timezone } from '../../../src/domain/shared/valueobjects/Timezone';
import { Currency } from '../../../src/domain/shared/valueobjects/Currency';
import { ValidationError } from '../../../src/domain/shared/errors/ValidationError';
import { OrganizationCreatedEvent } from '../../../src/domain/organization/events/OrganizationCreatedEvent';
import { OrganizationSettingsUpdatedEvent } from '../../../src/domain/organization/events/OrganizationSettingsUpdatedEvent';
import { OrganizationDeactivatedEvent } from '../../../src/domain/organization/events/OrganizationDeactivatedEvent';

describe('Organization Aggregate', () => {
    it('should create a valid organization and emit OrganizationCreatedEvent', () => {
        const id = new OrganizationId('org-123');
        const org = Organization.create(id, 'QEOS Inc');

        expect(org.id.value).toBe('org-123');
        expect(org.name).toBe('QEOS Inc');
        expect(org.isActive).toBe(true);
        expect(org.domainEvents.length).toBe(1);
        expect(org.domainEvents[0]).toBeInstanceOf(OrganizationCreatedEvent);
    });

    it('should throw error when creating with empty name', () => {
        const id = new OrganizationId('org-123');
        expect(() => Organization.create(id, '   ')).toThrow(ValidationError);
    });

    it('should update settings and emit OrganizationSettingsUpdatedEvent', () => {
        const id = new OrganizationId('org-123');
        const org = Organization.create(id, 'QEOS Inc');
        org.clearDomainEvents();

        const taxId = TaxId.create('TAX-456');
        const tz = Timezone.create('UTC');
        const cur = new Currency('USD');

        org.updateSettings(taxId, tz, cur);

        expect(org.taxId?.value).toBe('TAX-456');
        expect(org.timezone?.value).toBe('UTC');
        expect(org.currency?.code).toBe('USD');
        expect(org.domainEvents.length).toBe(1);
        expect(org.domainEvents[0]).toBeInstanceOf(OrganizationSettingsUpdatedEvent);
    });

    it('should throw error when updating settings for inactive organization', () => {
        const id = new OrganizationId('org-123');
        const org = Organization.create(id, 'QEOS Inc');
        org.deactivate();
        
        const taxId = TaxId.create('TAX-456');
        expect(() => org.updateSettings(taxId)).toThrow(ValidationError);
    });

    it('should deactivate organization and emit OrganizationDeactivatedEvent', () => {
        const id = new OrganizationId('org-123');
        const org = Organization.create(id, 'QEOS Inc');
        org.clearDomainEvents();

        org.deactivate();

        expect(org.isActive).toBe(false);
        expect(org.domainEvents.length).toBe(1);
        expect(org.domainEvents[0]).toBeInstanceOf(OrganizationDeactivatedEvent);
    });
});
