import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

# Contracts
create_file('src/domain/accounting/contracts/IGeneralLedger.ts', """import { PostingBatchId } from '../valueobjects/PostingBatchId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export interface IGeneralLedger {
    recordPostingBatch(organizationId: OrganizationId, batchId: PostingBatchId): Promise<void>;
}
""")

create_file('src/domain/accounting/contracts/ITrialBalance.ts', """import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export interface ITrialBalance {
    calculate(organizationId: OrganizationId, periodId: string): Promise<any>;
}
""")

create_file('src/domain/accounting/contracts/IFinancialStatements.ts', """import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export interface IFinancialStatements {
    generateBalanceSheet(organizationId: OrganizationId, periodId: string): Promise<any>;
    generateIncomeStatement(organizationId: OrganizationId, periodId: string): Promise<any>;
}
""")

create_file('src/domain/accounting/contracts/ICashFlow.ts', """import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export interface ICashFlow {
    generateStatement(organizationId: OrganizationId, periodId: string): Promise<any>;
}
""")

print("Contracts generated")
