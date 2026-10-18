import { SupabaseClient } from '@supabase/supabase-js';
import { ILedgerEntryQuery, LedgerAccountBalance } from '../../../domain/accounting/repositories/ILedgerEntryQuery';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';

export class SupabaseLedgerEntryQuery implements ILedgerEntryQuery {
    constructor(private readonly supabase: SupabaseClient) {}

    public async calculateBalancesByDateRange(organizationId: OrganizationId, startDate: Date, endDate: Date): Promise<LedgerAccountBalance[]> {
        // Query only from the ledger, joining with accounts to get number and name
        // We aggregate the debits and credits
        const { data, error } = await this.supabase
            .from('accounting_ledger_entries')
            .select(`
                account_id,
                debit,
                credit,
                accounting_accounts (
                    code,
                    name
                )
            `)
            .eq('organization_id', organizationId.value)
            .gte('accounting_date', startDate.toISOString())
            .lte('accounting_date', endDate.toISOString());

        if (error) {
            throw new Error(`Failed to calculate ledger balances: ${error.message}`);
        }

        const balanceMap = new Map<string, LedgerAccountBalance>();

        for (const row of data || []) {
            const accId = row.account_id;
            const accData = row.accounting_accounts as any; // Due to join
            if (!accData) continue;

            if (!balanceMap.has(accId)) {
                balanceMap.set(accId, {
                    accountId: accId,
                    accountNumber: accData.code,
                    accountName: accData.name,
                    totalDebit: 0,
                    totalCredit: 0
                });
            }

            const bal = balanceMap.get(accId)!;
            bal.totalDebit += row.debit || 0;
            bal.totalCredit += row.credit || 0;
        }

        // Return only accounts with non-zero balances
        return Array.from(balanceMap.values()).filter(b => b.totalDebit !== 0 || b.totalCredit !== 0);
    }
}
