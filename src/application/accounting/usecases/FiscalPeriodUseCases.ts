import { IFiscalYearRepository } from '../ports/IFiscalYearRepository';
import { IFinancialAuditEventRepository } from '../ports/IFinancialAuditEventRepository';
import { IEventBus } from '../../ports/IEventBus';
import { FiscalYearDTO, AccountingPeriodDTO } from '../dtos/FiscalPeriodDTO';
import { FiscalYear } from '../../../domain/accounting/aggregates/FiscalYear';
import { FiscalYearId } from '../../../domain/accounting/valueobjects/FiscalYearId';
import { AccountingPeriod } from '../../../domain/accounting/entities/AccountingPeriod';
import { AccountingPeriodId } from '../../../domain/accounting/valueobjects/AccountingPeriodId';
import { PeriodStatus } from '../../../domain/accounting/valueobjects/PeriodStatus';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { FinancialAuditEvent, AuditEventId, AuditEventType } from '../../../domain/accounting/aggregates/FinancialAuditEvent';
import { BusinessRuleError } from '../../../domain/shared/errors/BusinessRuleError';
import * as crypto from 'crypto';

export class FiscalPeriodUseCases {
    constructor(
        private readonly fiscalYearRepo: IFiscalYearRepository,
        private readonly auditRepo: IFinancialAuditEventRepository,
        private readonly eventBus: IEventBus
    ) {}

    public async createFiscalYear(organizationId: string, year: number, startDate: Date, endDate: Date): Promise<FiscalYearDTO> {
        const orgId = new OrganizationId(organizationId);
        
        const existing = await this.fiscalYearRepo.findByYear(orgId, year);
        if (existing) throw new BusinessRuleError(`Fiscal year ${year} already exists.`);

        // Create 12 monthly periods (simplified)
        const periods: AccountingPeriod[] = [];
        let currentStart = new Date(startDate);
        for (let i = 1; i <= 12; i++) {
            let nextStart = new Date(currentStart);
            nextStart.setMonth(nextStart.getMonth() + 1);
            let currentEnd = new Date(nextStart.getTime() - 1);
            
            // Adjust last period to match exact end date if needed
            if (i === 12) {
                currentEnd = new Date(endDate);
            }

            periods.push(AccountingPeriod.create(
                new AccountingPeriodId(crypto.randomUUID()),
                i,
                `${year}-${i.toString().padStart(2, '0')}`,
                new Date(currentStart),
                new Date(currentEnd)
            ));
            
            currentStart = new Date(nextStart);
        }

        const fiscalYear = FiscalYear.create(
            new FiscalYearId(crypto.randomUUID()),
            orgId,
            year,
            startDate,
            endDate,
            periods
        );

        await this.fiscalYearRepo.save(fiscalYear);
        for (const event of fiscalYear.domainEvents) {
            await this.eventBus.publish(event);
        }
        fiscalYear.clearDomainEvents();

        return this.mapToDTO(fiscalYear);
    }

    public async closeFiscalYear(organizationId: string, fiscalYearId: string, userId: string): Promise<void> {
        const orgId = new OrganizationId(organizationId);
        const fy = await this.fiscalYearRepo.findById(orgId, new FiscalYearId(fiscalYearId));
        if (!fy) throw new BusinessRuleError('Fiscal year not found');

        const previousStatus = fy.status.value;
        fy.close(); // validates internally that all periods are locked or archived

        await this.fiscalYearRepo.save(fy);
        
        // Audit Event
        const auditEvent = FinancialAuditEvent.create(
            new AuditEventId(crypto.randomUUID()),
            orgId,
            'CLOSING',
            userId,
            previousStatus,
            fy.status.value,
            'Year-End Closing',
            fy.id.value,
            'FiscalYear'
        );
        await this.auditRepo.save(auditEvent);

        for (const event of fy.domainEvents) {
            await this.eventBus.publish(event);
        }
        fy.clearDomainEvents();
    }

    public async changePeriodStatus(organizationId: string, fiscalYearId: string, periodId: string, newStatus: string, userId: string, reason: string): Promise<void> {
        const orgId = new OrganizationId(organizationId);
        const fy = await this.fiscalYearRepo.findById(orgId, new FiscalYearId(fiscalYearId));
        if (!fy) throw new BusinessRuleError('Fiscal year not found');

        const period = fy.periods.find(p => p.id.value === periodId);
        if (!period) throw new BusinessRuleError('Period not found');
        
        const previousStatus = period.status.value;
        
        const statusObj = new PeriodStatus(newStatus);
        
        // REOPENING rule
        let isReopening = false;
        if ((previousStatus === 'LOCKED' || previousStatus === 'CLOSING') && (newStatus === 'OPENING' || newStatus === 'CLOSING')) {
            isReopening = true;
            if (!reason || reason.trim().length < 10) {
                throw new BusinessRuleError('Re-opening a period requires a comprehensive reason for audit');
            }
        }

        fy.changePeriodStatus(new AccountingPeriodId(periodId), statusObj);

        await this.fiscalYearRepo.save(fy);

        const auditEventType = isReopening ? 'REOPENING' : 'CLOSING';
        const auditEvent = FinancialAuditEvent.create(
            new AuditEventId(crypto.randomUUID()),
            orgId,
            auditEventType,
            userId,
            previousStatus,
            newStatus,
            reason || `Status changed from ${previousStatus} to ${newStatus}`,
            periodId,
            'AccountingPeriod'
        );
        await this.auditRepo.save(auditEvent);

        for (const event of fy.domainEvents) {
            await this.eventBus.publish(event);
        }
        fy.clearDomainEvents();
    }

    public async getFiscalYear(organizationId: string, year: number): Promise<FiscalYearDTO | null> {
        const fy = await this.fiscalYearRepo.findByYear(new OrganizationId(organizationId), year);
        if (!fy) return null;
        return this.mapToDTO(fy);
    }

    public async getPeriodForDate(organizationId: string, date: Date): Promise<AccountingPeriodDTO | null> {
        const fys = await this.fiscalYearRepo.findAll(new OrganizationId(organizationId));
        for (const fy of fys) {
            const period = fy.getPeriodForDate(date);
            if (period) {
                return {
                    id: period.id.value,
                    periodNumber: period.periodNumber,
                    name: period.name,
                    startDate: period.startDate.toISOString(),
                    endDate: period.endDate.toISOString(),
                    status: period.status.value
                };
            }
        }
        return null;
    }

    private mapToDTO(fy: FiscalYear): FiscalYearDTO {
        return {
            id: fy.id.value,
            organizationId: fy.organizationId.value,
            year: fy.year,
            startDate: fy.startDate.toISOString(),
            endDate: fy.endDate.toISOString(),
            status: fy.status.value,
            periods: fy.periods.map(p => ({
                id: p.id.value,
                periodNumber: p.periodNumber,
                name: p.name,
                startDate: p.startDate.toISOString(),
                endDate: p.endDate.toISOString(),
                status: p.status.value
            }))
        };
    }
}
