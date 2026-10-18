import { describe, it, expect } from 'vitest';
import { Branch } from '../../../src/domain/organization/aggregates/Branch';
import { BranchId } from '../../../src/domain/shared/valueobjects/BranchId';
import { OrganizationId } from '../../../src/domain/shared/valueobjects/OrganizationId';
import { BranchCode } from '../../../src/domain/shared/valueobjects/BranchCode';
import { BranchName } from '../../../src/domain/shared/valueobjects/BranchName';
import { BranchAddress } from '../../../src/domain/shared/valueobjects/BranchAddress';
import { BranchStatus, BranchType } from '../../../src/domain/organization/types/BranchTypes';
import { ValidationError } from '../../../src/domain/shared/errors/ValidationError';
import { BranchCreatedEvent } from '../../../src/domain/organization/events/BranchCreatedEvent';
import { BranchActivatedEvent } from '../../../src/domain/organization/events/BranchActivatedEvent';
import { BranchDeactivatedEvent } from '../../../src/domain/organization/events/BranchDeactivatedEvent';
import { BranchArchivedEvent } from '../../../src/domain/organization/events/BranchArchivedEvent';

describe('Branch Aggregate', () => {
    it('should create a valid branch and emit BranchCreatedEvent', () => {
        const id = new BranchId('branch-1');
        const orgId = new OrganizationId('org-1');
        const code = BranchCode.create('NYC-01');
        const profile = {
            name: BranchName.create('New York HQ'),
            address: BranchAddress.create('123 Broadway', 'New York', 'NY', 'USA', '10001')
        };
        const settings = { type: BranchType.HEADQUARTERS };

        const branch = Branch.create(id, orgId, code, profile, settings);

        expect(branch.id.value).toBe('branch-1');
        expect(branch.organizationId.value).toBe('org-1');
        expect(branch.code.value).toBe('NYC-01');
        expect(branch.status).toBe(BranchStatus.ACTIVE);
        expect(branch.domainEvents.length).toBe(1);
        expect(branch.domainEvents[0]).toBeInstanceOf(BranchCreatedEvent);
    });

    it('should deactivate branch and emit BranchDeactivatedEvent', () => {
        const branch = Branch.create(
            new BranchId('b1'), 
            new OrganizationId('o1'), 
            BranchCode.create('C1'), 
            { name: BranchName.create('N1'), address: BranchAddress.create('S', 'C', 'S', 'C', 'P') }
        );
        branch.clearDomainEvents();

        branch.deactivate();

        expect(branch.status).toBe(BranchStatus.INACTIVE);
        expect(branch.domainEvents.length).toBe(1);
        expect(branch.domainEvents[0]).toBeInstanceOf(BranchDeactivatedEvent);
    });

    it('should not deactivate already inactive branch', () => {
        const branch = Branch.create(
            new BranchId('b1'), 
            new OrganizationId('o1'), 
            BranchCode.create('C1'), 
            { name: BranchName.create('N1'), address: BranchAddress.create('S', 'C', 'S', 'C', 'P') }
        );
        branch.deactivate();
        expect(() => branch.deactivate()).toThrow(ValidationError);
    });

    it('should archive branch and prevent further state changes', () => {
        const branch = Branch.create(
            new BranchId('b1'), 
            new OrganizationId('o1'), 
            BranchCode.create('C1'), 
            { name: BranchName.create('N1'), address: BranchAddress.create('S', 'C', 'S', 'C', 'P') }
        );
        branch.clearDomainEvents();

        branch.archive();

        expect(branch.status).toBe(BranchStatus.ARCHIVED);
        expect(branch.domainEvents.length).toBe(1);
        expect(branch.domainEvents[0]).toBeInstanceOf(BranchArchivedEvent);

        expect(() => branch.deactivate()).toThrow(ValidationError);
        expect(() => branch.activate()).toThrow(ValidationError);
        expect(() => branch.updateProfile(branch.profile)).toThrow(ValidationError);
        expect(() => branch.updateSettings(branch.settings)).toThrow(ValidationError);
    });
});
