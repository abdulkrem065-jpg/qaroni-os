import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

# Contracts
create_file('src/domain/accounting/contracts/IIncomeStatement.ts', """import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export interface IIncomeStatement {
    generate(organizationId: OrganizationId, periodId: string): Promise<any>;
}
""")

create_file('src/domain/accounting/contracts/IFinancialRatios.ts', """import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export interface IFinancialRatios {
    calculate(organizationId: OrganizationId, periodId: string): Promise<any>;
}
""")

print("Balance Sheet Contracts generated")
