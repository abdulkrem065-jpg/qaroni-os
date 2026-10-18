import { describe, it, expect } from 'vitest';
import { CashFlowStatement } from './CashFlowStatement';
import { CashFlowStatementId } from '../valueobjects/CashFlowStatementId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { BalanceSheetId } from '../valueobjects/BalanceSheetId';
import { IncomeStatementId } from '../valueobjects/IncomeStatementId';
import { CashFlowPeriod } from '../valueobjects/CashFlowPeriod';
import { CashFlowSection } from '../entities/CashFlowSection';
import { CashFlowLine } from '../entities/CashFlowLine';
import { EntityId } from '../../shared/valueobjects/EntityId';
import { OpeningCashBalance } from '../valueobjects/OpeningCashBalance';
import { ClosingCashBalance } from '../valueobjects/ClosingCashBalance';
import * as crypto from 'crypto';

describe('CashFlowStatement Aggregate', () => {
    const orgId = new OrganizationId(crypto.randomUUID());
    const startBsId = new BalanceSheetId(crypto.randomUUID());
    const endBsId = new BalanceSheetId(crypto.randomUUID());
    const isId = new IncomeStatementId(crypto.randomUUID());
    const period = new CashFlowPeriod(new Date('2023-01-01'), new Date('2023-12-31'));

    it('should generate cash flow statement correctly and reconcile', () => {
        const operatingLine = CashFlowLine.create(
            new EntityId(crypto.randomUUID()),
            null,
            'Cash received from customers',
            10000
        );

        const investingLine = CashFlowLine.create(
            new EntityId(crypto.randomUUID()),
            null,
            'Purchase of equipment',
            -3000
        );

        const financingLine = CashFlowLine.create(
            new EntityId(crypto.randomUUID()),
            null,
            'Bank loan received',
            5000
        );

        const operatingSection = CashFlowSection.create(
            new EntityId(crypto.randomUUID()),
            'OPERATING',
            [operatingLine]
        );

        const investingSection = CashFlowSection.create(
            new EntityId(crypto.randomUUID()),
            'INVESTING',
            [investingLine]
        );

        const financingSection = CashFlowSection.create(
            new EntityId(crypto.randomUUID()),
            'FINANCING',
            [financingLine]
        );

        const openingCash = new OpeningCashBalance(5000);
        // Net movement = 10000 - 3000 + 5000 = 12000
        // Expected Closing = 5000 + 12000 = 17000
        const closingCash = new ClosingCashBalance(17000);

        const cf = CashFlowStatement.generate(
            new CashFlowStatementId(crypto.randomUUID()),
            orgId,
            startBsId,
            endBsId,
            isId,
            period,
            [operatingSection, investingSection, financingSection],
            openingCash,
            closingCash
        );

        const totals = cf.calculateTotals();
        expect(totals.operating.value).toBe(10000);
        expect(totals.investing.value).toBe(-3000);
        expect(totals.financing.value).toBe(5000);
        expect(totals.netMovement.value).toBe(12000);

        expect(cf.status).toBe('DRAFT');
        expect(cf.domainEvents.length).toBe(2); // Generated, PositionChanged

        cf.publish();
        expect(cf.status).toBe('PUBLISHED');
        expect(cf.domainEvents.length).toBe(3); // + Validated
    });

    it('should throw error on mismatch and emit event', () => {
        const operatingLine = CashFlowLine.create(
            new EntityId(crypto.randomUUID()),
            null,
            'Net income adjustment',
            2000
        );

        const openingCash = new OpeningCashBalance(1000);
        // Net movement = 2000
        // Expected Closing = 3000, we provide 4000 to force failure
        const closingCash = new ClosingCashBalance(4000);

        expect(() => {
            CashFlowStatement.generate(
                new CashFlowStatementId(crypto.randomUUID()),
                orgId,
                startBsId,
                endBsId,
                isId,
                period,
                [CashFlowSection.create(new EntityId(crypto.randomUUID()), 'OPERATING', [operatingLine])],
                openingCash,
                closingCash
            );
        }).toThrow(/Cash Flow Reconciliation Failed/);
    });
});
