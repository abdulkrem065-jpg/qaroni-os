import { IEquityStatementRepository } from '../../../domain/accounting/repositories/IEquityStatementRepository';
import { IIncomeStatementRepository } from '../../../domain/accounting/repositories/IIncomeStatementRepository';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { EquityStatementId } from '../../../domain/accounting/valueobjects/EquityStatementId';
import { IncomeStatementId } from '../../../domain/accounting/valueobjects/IncomeStatementId';
import { EquityStatementPeriod } from '../../../domain/accounting/valueobjects/EquityStatementPeriod';
import { EquityStatementLine, EquityStatementLineId } from '../../../domain/accounting/entities/EquityStatementLine';
import { EquityStatement } from '../../../domain/accounting/aggregates/EquityStatement';
import { BusinessRuleError } from '../../../domain/shared/errors/BusinessRuleError';
import { IEventBus } from '../../ports/IEventBus';
import * as crypto from 'crypto';

export interface GenerateEquityStatementDTO {
    organizationId: string;
    incomeStatementId: string;
    startDate: string;
    endDate: string;
    openingBalance: number;
    dividends: number;
    capitalContributions: number;
    priorPeriodAdjustments: number;
}

export interface EquityStatementDTO {
    id: string;
    organizationId: string;
    incomeStatementId: string;
    startDate: string;
    endDate: string;
    status: string;
    generatedAt: string;
    openingBalance: number;
    closingBalance: number;
    lines: Array<{
        id: string;
        classification: string;
        description: string;
        amount: number;
    }>;
}

export class EquityStatementUseCases {
    constructor(
        private readonly equityRepo: IEquityStatementRepository,
        private readonly incomeRepo: IIncomeStatementRepository,
        private readonly eventBus: IEventBus
    ) {}

    public async generateEquityStatement(dto: GenerateEquityStatementDTO): Promise<EquityStatementDTO> {
        const orgId = new OrganizationId(dto.organizationId);
        const isId = new IncomeStatementId(dto.incomeStatementId);

        // Fetch Income Statement to get Net Income
        const incomeStatement = await this.incomeRepo.findById(isId, orgId);
        if (!incomeStatement) throw new BusinessRuleError('Income Statement not found');

        const netIncome = incomeStatement.calculateNetProfit().value;

        // Build lines
        const lines: EquityStatementLine[] = [];
        
        if (dto.priorPeriodAdjustments !== 0) {
            lines.push(EquityStatementLine.create(
                new EquityStatementLineId(crypto.randomUUID()),
                'PRIOR_PERIOD_ADJUSTMENT',
                'Prior Period Adjustments',
                dto.priorPeriodAdjustments
            ));
        }

        lines.push(EquityStatementLine.create(
            new EquityStatementLineId(crypto.randomUUID()),
            'NET_INCOME',
            'Net Income for the Period',
            netIncome
        ));

        if (dto.dividends !== 0) {
            lines.push(EquityStatementLine.create(
                new EquityStatementLineId(crypto.randomUUID()),
                'DIVIDENDS',
                'Dividends Declared',
                -Math.abs(dto.dividends) // Always negative effect on equity
            ));
        }

        if (dto.capitalContributions !== 0) {
            lines.push(EquityStatementLine.create(
                new EquityStatementLineId(crypto.randomUUID()),
                'CAPITAL_CONTRIBUTION',
                'Capital Contributions',
                Math.abs(dto.capitalContributions) // Always positive effect
            ));
        }

        const netMovement = lines.reduce((sum, l) => sum + l.amount, 0);
        const closingBalance = dto.openingBalance + netMovement;

        const statement = EquityStatement.generate(
            new EquityStatementId(crypto.randomUUID()),
            orgId,
            isId,
            new EquityStatementPeriod(new Date(dto.startDate), new Date(dto.endDate)),
            lines,
            dto.openingBalance,
            closingBalance
        );

        await this.equityRepo.save(statement);
        
        for (const event of statement.domainEvents) {
            await this.eventBus.publish(event);
        }
        statement.clearDomainEvents();

        return this.mapToDTO(statement);
    }

    public async getEquityStatement(organizationId: string, id: string): Promise<EquityStatementDTO> {
        const statement = await this.equityRepo.findById(new EquityStatementId(id), new OrganizationId(organizationId));
        if (!statement) throw new BusinessRuleError('Equity Statement not found');
        return this.mapToDTO(statement);
    }

    private mapToDTO(statement: EquityStatement): EquityStatementDTO {
        return {
            id: statement.id.value,
            organizationId: statement.organizationId.value,
            incomeStatementId: statement.incomeStatementId.value,
            startDate: statement.period.startDate.toISOString(),
            endDate: statement.period.endDate.toISOString(),
            status: statement.status,
            generatedAt: statement.generatedAt.toISOString(),
            openingBalance: statement.openingBalance,
            closingBalance: statement.closingBalance,
            lines: statement.lines.map(l => ({
                id: l.id.value,
                classification: l.classification,
                description: l.description,
                amount: l.amount
            }))
        };
    }
}
