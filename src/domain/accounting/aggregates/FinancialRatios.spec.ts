import { describe, it, expect } from 'vitest';
import { FinancialRatios } from './FinancialRatios';
import { FinancialRatiosId } from '../valueobjects/FinancialRatiosId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { BalanceSheetId } from '../valueobjects/BalanceSheetId';
import { IncomeStatementId } from '../valueobjects/IncomeStatementId';
import { CashFlowStatementId } from '../valueobjects/CashFlowStatementId';
import { RatioResult } from '../entities/RatioResult';
import { RatioId } from '../valueobjects/RatioId';
import { RatioName } from '../valueobjects/RatioName';
import { RatioValue } from '../valueobjects/RatioValue';
import { RatioBenchmark } from '../valueobjects/RatioBenchmark';
import * as crypto from 'crypto';

describe('FinancialRatios Aggregate', () => {
    it('should generate financial ratios correctly', () => {
        const orgId = new OrganizationId(crypto.randomUUID());
        const bsId = new BalanceSheetId(crypto.randomUUID());
        const isId = new IncomeStatementId(crypto.randomUUID());
        const cfId = new CashFlowStatementId(crypto.randomUUID());
        const periodEnd = new Date('2023-12-31');

        const currentRatio = RatioResult.create(
            new RatioId(crypto.randomUUID()),
            'LIQUIDITY',
            new RatioName('Current Ratio'),
            new RatioValue(1.5),
            new RatioBenchmark(1.2),
            'HEALTHY'
        );

        const ratios = FinancialRatios.generate(
            new FinancialRatiosId(crypto.randomUUID()),
            orgId,
            bsId,
            isId,
            cfId,
            periodEnd,
            [currentRatio]
        );

        expect(ratios.results.length).toBe(1);
        expect(ratios.results[0].category).toBe('LIQUIDITY');
        expect(ratios.status).toBe('DRAFT');
        expect(ratios.domainEvents.length).toBe(2); // Generated + 1 Calculated

        ratios.publish();
        expect(ratios.status).toBe('PUBLISHED');
        expect(ratios.domainEvents.length).toBe(3); // + Validated
    });

    it('should throw error on invalid ratio name', () => {
        expect(() => {
            new RatioName('');
        }).toThrow(/RatioName cannot be empty/);
    });
});
