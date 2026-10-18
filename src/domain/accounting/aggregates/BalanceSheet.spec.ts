import { describe, it, expect } from 'vitest';
import { BalanceSheet } from './BalanceSheet';
import { BalanceSheetId } from '../valueobjects/BalanceSheetId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { BalanceSheetPeriod } from '../valueobjects/BalanceSheetPeriod';
import { TrialBalanceId } from '../valueobjects/TrialBalanceId';
import { BalanceSheetSection } from '../entities/BalanceSheetSection';
import { BalanceSheetLine } from '../entities/BalanceSheetLine';
import { EntityId } from '../../shared/valueobjects/EntityId';
import { AccountId } from '../valueobjects/AccountId';
import { BusinessRuleError } from '../../shared/errors/BusinessRuleError';
import * as crypto from 'crypto';

describe('BalanceSheet Aggregate', () => {
    const orgId = new OrganizationId(crypto.randomUUID());
    const tbId = new TrialBalanceId(crypto.randomUUID());
    const period = new BalanceSheetPeriod(new Date('2026-07-01'), new Date('2026-07-31'));

    it('should create a balanced BalanceSheet', () => {
        const sections = [
            BalanceSheetSection.create(
                new EntityId(crypto.randomUUID()),
                'ASSETS',
                'CURRENT_ASSETS',
                [
                    BalanceSheetLine.create(new EntityId(crypto.randomUUID()), new AccountId(crypto.randomUUID()), '1000', 'Cash', 1000)
                ]
            ),
            BalanceSheetSection.create(
                new EntityId(crypto.randomUUID()),
                'LIABILITIES',
                'CURRENT_LIABILITIES',
                [
                    BalanceSheetLine.create(new EntityId(crypto.randomUUID()), new AccountId(crypto.randomUUID()), '2000', 'Accounts Payable', 400)
                ]
            ),
            BalanceSheetSection.create(
                new EntityId(crypto.randomUUID()),
                'EQUITY',
                'CAPITAL',
                [
                    BalanceSheetLine.create(new EntityId(crypto.randomUUID()), new AccountId(crypto.randomUUID()), '3000', 'Owner Equity', 600)
                ]
            )
        ];

        const bs = BalanceSheet.generate(
            new BalanceSheetId(crypto.randomUUID()),
            orgId,
            tbId,
            period,
            sections
        );

        expect(bs.calculateAssetTotal().value).toBe(1000);
        expect(bs.calculateLiabilityTotal().value).toBe(400);
        expect(bs.calculateEquityTotal().value).toBe(600);
    });

    it('should throw an error if Assets != Liabilities + Equity', () => {
        const sections = [
            BalanceSheetSection.create(
                new EntityId(crypto.randomUUID()),
                'ASSETS',
                'CURRENT_ASSETS',
                [
                    BalanceSheetLine.create(new EntityId(crypto.randomUUID()), new AccountId(crypto.randomUUID()), '1000', 'Cash', 1000)
                ]
            ),
            BalanceSheetSection.create(
                new EntityId(crypto.randomUUID()),
                'LIABILITIES',
                'CURRENT_LIABILITIES',
                [
                    BalanceSheetLine.create(new EntityId(crypto.randomUUID()), new AccountId(crypto.randomUUID()), '2000', 'Accounts Payable', 400)
                ]
            ),
            BalanceSheetSection.create(
                new EntityId(crypto.randomUUID()),
                'EQUITY',
                'CAPITAL',
                [
                    BalanceSheetLine.create(new EntityId(crypto.randomUUID()), new AccountId(crypto.randomUUID()), '3000', 'Owner Equity', 500) // 1000 != 400 + 500
                ]
            )
        ];

        expect(() => {
            BalanceSheet.generate(
                new BalanceSheetId(crypto.randomUUID()),
                orgId,
                tbId,
                period,
                sections
            );
        }).toThrow(BusinessRuleError);
    });
});
