import { describe, it, expect } from 'vitest';
import { IncomeStatement } from './IncomeStatement';
import { IncomeStatementId } from '../valueobjects/IncomeStatementId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { TrialBalanceId } from '../valueobjects/TrialBalanceId';
import { IncomeStatementPeriod } from '../valueobjects/IncomeStatementPeriod';
import { IncomeStatementSection } from '../entities/IncomeStatementSection';
import { IncomeStatementLine } from '../entities/IncomeStatementLine';
import { EntityId } from '../../shared/valueobjects/EntityId';
import { AccountId } from '../valueobjects/AccountId';
import * as crypto from 'crypto';

describe('IncomeStatement Aggregate', () => {
    const orgId = new OrganizationId(crypto.randomUUID());
    const tbId = new TrialBalanceId(crypto.randomUUID());
    const period = new IncomeStatementPeriod(new Date('2023-01-01'), new Date('2023-12-31'));

    it('should generate income statement correctly and calculate profits', () => {
        const revLine = IncomeStatementLine.create(
            new EntityId(crypto.randomUUID()),
            new AccountId(crypto.randomUUID()),
            '4100',
            'Sales',
            10000
        );

        const cogsLine = IncomeStatementLine.create(
            new EntityId(crypto.randomUUID()),
            new AccountId(crypto.randomUUID()),
            '5100',
            'COGS',
            4000
        );

        const opExLine = IncomeStatementLine.create(
            new EntityId(crypto.randomUUID()),
            new AccountId(crypto.randomUUID()),
            '6100',
            'Payroll',
            2000
        );

        const revSection = IncomeStatementSection.create(
            new EntityId(crypto.randomUUID()),
            'REVENUE',
            'SALES_REVENUE',
            [revLine]
        );

        const cogsSection = IncomeStatementSection.create(
            new EntityId(crypto.randomUUID()),
            'COGS',
            'INVENTORY_COST',
            [cogsLine]
        );

        const opExSection = IncomeStatementSection.create(
            new EntityId(crypto.randomUUID()),
            'OPERATING_EXPENSES',
            'PAYROLL',
            [opExLine]
        );

        const is = IncomeStatement.generate(
            new IncomeStatementId(crypto.randomUUID()),
            orgId,
            tbId,
            period,
            [revSection, cogsSection, opExSection]
        );

        const gp = is.calculateGrossProfit();
        expect(gp.value).toBe(6000); // 10000 - 4000

        const op = is.calculateOperatingProfit();
        expect(op.value).toBe(4000); // 6000 - 2000

        const np = is.calculateNetProfit();
        expect(np.value).toBe(4000); // No fin expense or depreciation

        expect(is.status).toBe('DRAFT');
        expect(is.domainEvents.length).toBe(2); // Generated, ProfitCalculated

        is.publish();
        expect(is.status).toBe('PUBLISHED');
        expect(is.domainEvents.length).toBe(3); // + Validated
    });

    it('should detect loss correctly', () => {
        const revLine = IncomeStatementLine.create(
            new EntityId(crypto.randomUUID()),
            new AccountId(crypto.randomUUID()),
            '4100',
            'Sales',
            5000
        );

        const opExLine = IncomeStatementLine.create(
            new EntityId(crypto.randomUUID()),
            new AccountId(crypto.randomUUID()),
            '6100',
            'Payroll',
            7000
        );

        const is = IncomeStatement.generate(
            new IncomeStatementId(crypto.randomUUID()),
            orgId,
            tbId,
            period,
            [
                IncomeStatementSection.create(
                    new EntityId(crypto.randomUUID()),
                    'REVENUE',
                    'SALES_REVENUE',
                    [revLine]
                ),
                IncomeStatementSection.create(
                    new EntityId(crypto.randomUUID()),
                    'OPERATING_EXPENSES',
                    'PAYROLL',
                    [opExLine]
                )
            ]
        );

        const np = is.calculateNetProfit();
        expect(np.value).toBe(-2000);

        expect(is.domainEvents[1].eventName).toBe('LossDetectedEvent');
    });
});
