import { describe, it, expect } from 'vitest';
import { FinancialValidation } from './FinancialValidation';
import { ValidationId } from '../valueobjects/ValidationId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { ValidationCategory } from '../valueobjects/ValidationCategory';
import { ValidationResult } from '../entities/ValidationResult';
import { ValidationIssue } from '../entities/ValidationIssue';
import { ValidationCode } from '../valueobjects/ValidationCode';
import { ValidationSeverity } from '../valueobjects/ValidationSeverity';
import { EntityId } from '../../shared/valueobjects/EntityId';
import * as crypto from 'crypto';

describe('FinancialValidation Aggregate', () => {
    const orgId = new OrganizationId(crypto.randomUUID());

    it('should create validation successfully', () => {
        const val = FinancialValidation.start(
            new ValidationId(crypto.randomUUID()),
            orgId,
            new ValidationCategory('ALL')
        );

        expect(val.status).toBe('RUNNING');
        expect(val.domainEvents.length).toBe(1); // StartedEvent

        const res1 = ValidationResult.create(
            new EntityId(crypto.randomUUID()),
            new ValidationCategory('CHART_OF_ACCOUNTS'),
            [],
            100
        );

        val.addResult(res1);
        val.complete();

        expect(val.status).toBe('COMPLETED');
        expect(val.isPassed).toBe(true);
        expect(val.domainEvents.length).toBe(2); // Started, Completed
    });

    it('should fail if issues have error severity', () => {
        const val = FinancialValidation.start(
            new ValidationId(crypto.randomUUID()),
            orgId,
            new ValidationCategory('ALL')
        );

        const issues = [
            ValidationIssue.create(
                new EntityId(crypto.randomUUID()),
                new ValidationCode('ERR-01'),
                new ValidationSeverity('ERROR'),
                'Test Error'
            )
        ];

        const res1 = ValidationResult.create(
            new EntityId(crypto.randomUUID()),
            new ValidationCategory('CHART_OF_ACCOUNTS'),
            issues,
            100
        );

        val.addResult(res1);
        val.complete();

        expect(val.status).toBe('COMPLETED');
        expect(val.isPassed).toBe(false);
        expect(val.domainEvents.length).toBe(3); // Started, Completed, ViolationDetected
    });

    it('should fail execution directly', () => {
        const val = FinancialValidation.start(
            new ValidationId(crypto.randomUUID()),
            orgId,
            new ValidationCategory('ALL')
        );

        val.fail('System error');

        expect(val.status).toBe('FAILED');
        expect(val.isPassed).toBe(false);
        expect(val.domainEvents.length).toBe(2); // Started, Failed
    });
});
