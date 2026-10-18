export interface CreateCurrencyDTO {
    organizationId: string;
    code: string;
    symbol: string;
    isBase?: boolean;
}

export interface UpdateCurrencyDTO {
    organizationId: string;
    currencyId: string;
    symbol: string;
}

export interface CreateExchangeRateDTO {
    organizationId: string;
    fromCurrencyId: string;
    toCurrencyId: string;
    rate: number;
    effectiveDate: string;
}

export interface CreateFiscalYearDTO {
    organizationId: string;
    year: number;
    periods: {
        id: string;
        name: string;
        startDate: string;
        endDate: string;
    }[];
}

export interface CreateTaxProfileDTO {
    organizationId: string;
    name: string;
    rate: number;
}

export interface UpdateTaxProfileDTO {
    organizationId: string;
    taxProfileId: string;
    name: string;
    rate: number;
    isActive: boolean;
}

export interface CreateNumberSequenceDTO {
    organizationId: string;
    entityType: string;
    prefix: string;
    pattern: string;
}

export interface CurrencyResponseDTO {
    id: string;
    code: string;
    symbol: string;
    isBase: boolean;
}
