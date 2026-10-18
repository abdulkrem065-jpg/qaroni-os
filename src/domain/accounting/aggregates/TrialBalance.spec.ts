import { describe, it, expect } from 'vitest';
import { TrialBalance } from './TrialBalance';
import { TrialBalanceId } from '../valueobjects/TrialBalanceId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { TrialBalancePeriod } from '../valueobjects/TrialBalancePeriod';
import { TrialBalancePeriodType } from '../valueobjects/TrialBalancePeriodType';
import { TrialBalanceAccount } from '../entities/TrialBalanceAccount';
import { EntityId } from '../../shared/valueobjects/EntityId';
import { AccountId } from '../valueobjects/AccountId';
import { BusinessRuleError } from '../../shared/errors/BusinessRuleError';
import * as crypto from 'crypto';

describe('TrialBalance Aggregate', () => {
    const orgId = new OrganizationId(crypto.randomUUID());
    const period = new TrialBalancePeriod(
        new TrialBalancePeriodType('MONTHLY'),
        new Date('2026-07-01'),
        new Date('2026-07-31')
    );

    it('should create a balanced TrialBalance', () => {
        const accounts = [
            TrialBalanceAccount.create(
                new EntityId(crypto.randomUUID()),
                new AccountId(crypto.randomUUID()),
                100, 0,
                '1000', 'Cash'
            ),
            TrialBalanceAccount.create(
                new EntityId(crypto.randomUUID()),
                new AccountId(crypto.randomUUID()),
                0, 100,
                '2000', 'Accounts Payable'
            )
        ];

        const tb = TrialBalance.generate(
            new TrialBalanceId(crypto.randomUUID()),
            orgId,
            period,
            accounts
        );

        expect(tb.calculateTotalDebit().value).toBe(100);
        expect(tb.calculateTotalCredit().value).toBe(100);
    });

    it('should throw an error if unbalanced', () => {
        const accounts = [
            TrialBalanceAccount.create(
                new EntityId(crypto.randomUUID()),
                new AccountId(crypto.randomUUID()),
                100, 0,
                '1000', 'Cash'
            ),
            TrialBalanceAccount.create(
                new EntityId(crypto.randomUUID()),
                new AccountId(crypto.randomUUID()),
                0, 50,
                '2000', 'Accounts Payable'
            )
        ];

        expect(() => {
            TrialBalance.generate(
                new TrialBalanceId(crypto.randomUUID()),
                orgId,
                period,
                accounts
            );
        }).toThrow(BusinessRuleError);
    });
});
