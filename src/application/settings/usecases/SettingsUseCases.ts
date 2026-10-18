import { ICurrencyRepository } from '../../../domain/settings/repositories/ICurrencyRepository';
import { IExchangeRateRepository } from '../../../domain/settings/repositories/IExchangeRateRepository';
import { IFiscalRepository } from '../../../domain/settings/repositories/IFiscalRepository';
import { ITaxRepository } from '../../../domain/settings/repositories/ITaxRepository';
import { INumberSequenceRepository } from '../../../domain/settings/repositories/INumberSequenceRepository';
import { IEventBus } from '../../ports/IEventBus';
import { Currency } from '../../../domain/settings/aggregates/Currency';
import { ExchangeRate } from '../../../domain/settings/aggregates/ExchangeRate';
import { FiscalCalendar, FiscalPeriod } from '../../../domain/settings/aggregates/FiscalCalendar';
import { TaxProfile } from '../../../domain/settings/aggregates/TaxProfile';
import { NumberSequence } from '../../../domain/settings/aggregates/NumberSequence';
import { CurrencyId } from '../../../domain/settings/valueobjects/CurrencyId';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { CurrencyCode } from '../../../domain/settings/valueobjects/CurrencyCode';
import { CurrencySymbol } from '../../../domain/settings/valueobjects/CurrencySymbol';
import { ExchangeRateId } from '../../../domain/settings/valueobjects/ExchangeRateId';
import { ExchangeRateValue } from '../../../domain/settings/valueobjects/ExchangeRateValue';
import { FiscalCalendarId } from '../../../domain/settings/valueobjects/FiscalCalendarId';
import { FiscalYear } from '../../../domain/settings/valueobjects/FiscalYear';
import { TaxProfileId } from '../../../domain/settings/valueobjects/TaxProfileId';
import { TaxRate } from '../../../domain/settings/valueobjects/TaxRate';
import { NumberSequenceId } from '../../../domain/settings/valueobjects/NumberSequenceId';
import { SequencePrefix } from '../../../domain/settings/valueobjects/SequencePrefix';
import { SequencePattern } from '../../../domain/settings/valueobjects/SequencePattern';
import * as crypto from 'crypto';
import { CreateCurrencyDTO, UpdateCurrencyDTO, CreateExchangeRateDTO, CreateFiscalYearDTO, CreateTaxProfileDTO, UpdateTaxProfileDTO, CreateNumberSequenceDTO, CurrencyResponseDTO } from '../dtos/SettingsDTOs';
import { BusinessRuleError } from '../../../domain/shared/errors/BusinessRuleError';

export class SettingsUseCases {
    constructor(
        private readonly currencyRepo: ICurrencyRepository,
        private readonly exchangeRateRepo: IExchangeRateRepository,
        private readonly fiscalRepo: IFiscalRepository,
        private readonly taxRepo: ITaxRepository,
        private readonly sequenceRepo: INumberSequenceRepository,
        private readonly eventBus: IEventBus
    ) {}

    // Currency
    public async createCurrency(dto: CreateCurrencyDTO): Promise<CurrencyResponseDTO> {
        const orgId = new OrganizationId(dto.organizationId);
        
        if (dto.isBase) {
            const currentBase = await this.currencyRepo.getBaseCurrency(orgId);
            if (currentBase) {
                currentBase.clearBase();
                await this.currencyRepo.save(currentBase);
            }
        }

        const currency = Currency.create(
            new CurrencyId(crypto.randomUUID()),
            orgId,
            new CurrencyCode(dto.code),
            new CurrencySymbol(dto.symbol),
            dto.isBase || false
        );

        await this.currencyRepo.save(currency);
        for (const ev of currency.domainEvents) await this.eventBus.publish(ev);
        currency.clearDomainEvents();

        return { id: currency.id.value, code: currency.code.value, symbol: currency.symbol.value, isBase: currency.isBase };
    }

    public async updateCurrency(dto: UpdateCurrencyDTO): Promise<void> {
        const orgId = new OrganizationId(dto.organizationId);
        const currency = await this.currencyRepo.findById(new CurrencyId(dto.currencyId), orgId);
        if (!currency) throw new BusinessRuleError('Currency not found');

        currency.update(new CurrencySymbol(dto.symbol));
        await this.currencyRepo.save(currency);
        for (const ev of currency.domainEvents) await this.eventBus.publish(ev);
        currency.clearDomainEvents();
    }

    public async changeBaseCurrency(organizationId: string, currencyId: string): Promise<void> {
        const orgId = new OrganizationId(organizationId);
        const currency = await this.currencyRepo.findById(new CurrencyId(currencyId), orgId);
        if (!currency) throw new BusinessRuleError('Currency not found');

        const currentBase = await this.currencyRepo.getBaseCurrency(orgId);
        if (currentBase && currentBase.id.value !== currency.id.value) {
            currentBase.clearBase();
            await this.currencyRepo.save(currentBase);
        }

        currency.setAsBase();
        await this.currencyRepo.save(currency);
        for (const ev of currency.domainEvents) await this.eventBus.publish(ev);
        currency.clearDomainEvents();
    }

    // Exchange Rate
    public async createExchangeRate(dto: CreateExchangeRateDTO): Promise<void> {
        const orgId = new OrganizationId(dto.organizationId);
        const rate = ExchangeRate.create(
            new ExchangeRateId(crypto.randomUUID()),
            orgId,
            new CurrencyId(dto.fromCurrencyId),
            new CurrencyId(dto.toCurrencyId),
            new ExchangeRateValue(dto.rate),
            new Date(dto.effectiveDate)
        );

        await this.exchangeRateRepo.save(rate);
        for (const ev of rate.domainEvents) await this.eventBus.publish(ev);
        rate.clearDomainEvents();
    }

    // Fiscal Calendar
    public async createFiscalYear(dto: CreateFiscalYearDTO): Promise<void> {
        const orgId = new OrganizationId(dto.organizationId);
        const year = new FiscalYear(dto.year);
        
        const existing = await this.fiscalRepo.findByYear(orgId, year);
        if (existing) throw new BusinessRuleError('Fiscal year already exists');

        const periods = dto.periods.map(p => new FiscalPeriod(
            p.id,
            p.name,
            new Date(p.startDate),
            new Date(p.endDate),
            'CLOSED' // start closed
        ));

        const calendar = FiscalCalendar.create(
            new FiscalCalendarId(crypto.randomUUID()),
            orgId,
            year,
            periods
        );

        await this.fiscalRepo.save(calendar);
        for (const ev of calendar.domainEvents) await this.eventBus.publish(ev);
        calendar.clearDomainEvents();
    }

    public async openFiscalPeriod(organizationId: string, year: number, periodId: string): Promise<void> {
        const orgId = new OrganizationId(organizationId);
        const calendar = await this.fiscalRepo.findByYear(orgId, new FiscalYear(year));
        if (!calendar) throw new BusinessRuleError('Fiscal calendar not found');

        calendar.openPeriod(periodId);
        await this.fiscalRepo.save(calendar);
        for (const ev of calendar.domainEvents) await this.eventBus.publish(ev);
        calendar.clearDomainEvents();
    }

    public async closeFiscalPeriod(organizationId: string, year: number, periodId: string): Promise<void> {
        const orgId = new OrganizationId(organizationId);
        const calendar = await this.fiscalRepo.findByYear(orgId, new FiscalYear(year));
        if (!calendar) throw new BusinessRuleError('Fiscal calendar not found');

        calendar.closePeriod(periodId);
        await this.fiscalRepo.save(calendar);
        for (const ev of calendar.domainEvents) await this.eventBus.publish(ev);
        calendar.clearDomainEvents();
    }

    // Tax Profile
    public async createTaxProfile(dto: CreateTaxProfileDTO): Promise<void> {
        const orgId = new OrganizationId(dto.organizationId);
        const tax = TaxProfile.create(
            new TaxProfileId(crypto.randomUUID()),
            orgId,
            dto.name,
            new TaxRate(dto.rate)
        );

        await this.taxRepo.save(tax);
        for (const ev of tax.domainEvents) await this.eventBus.publish(ev);
        tax.clearDomainEvents();
    }

    public async updateTaxProfile(dto: UpdateTaxProfileDTO): Promise<void> {
        const orgId = new OrganizationId(dto.organizationId);
        const tax = await this.taxRepo.findById(new TaxProfileId(dto.taxProfileId), orgId);
        if (!tax) throw new BusinessRuleError('Tax profile not found');

        tax.update(dto.name, new TaxRate(dto.rate), dto.isActive);
        await this.taxRepo.save(tax);
        for (const ev of tax.domainEvents) await this.eventBus.publish(ev);
        tax.clearDomainEvents();
    }

    // Number Sequence
    public async createNumberSequence(dto: CreateNumberSequenceDTO): Promise<void> {
        const orgId = new OrganizationId(dto.organizationId);
        
        const existing = await this.sequenceRepo.findByEntityType(orgId, dto.entityType);
        if (existing) throw new BusinessRuleError('Sequence for entity type already exists');

        const sequence = NumberSequence.create(
            new NumberSequenceId(crypto.randomUUID()),
            orgId,
            dto.entityType,
            new SequencePrefix(dto.prefix),
            new SequencePattern(dto.pattern)
        );

        await this.sequenceRepo.save(sequence);
        for (const ev of sequence.domainEvents) await this.eventBus.publish(ev);
        sequence.clearDomainEvents();
    }

    public async generateNextNumber(organizationId: string, entityType: string): Promise<string> {
        const orgId = new OrganizationId(organizationId);
        const sequence = await this.sequenceRepo.findByEntityType(orgId, entityType);
        if (!sequence) throw new BusinessRuleError('Sequence for entity type not found');

        const nextNum = sequence.generateNext();
        await this.sequenceRepo.save(sequence);
        for (const ev of sequence.domainEvents) await this.eventBus.publish(ev);
        sequence.clearDomainEvents();

        return nextNum;
    }
}
