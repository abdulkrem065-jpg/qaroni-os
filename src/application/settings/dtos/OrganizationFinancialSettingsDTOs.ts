export interface UpdateOrganizationFinancialSettingsDTO {
    organizationId: string;
    country: string;
    timeZone: string;
    defaultLanguage?: string;
    dateFormat: string;
    numberFormat: string;
    currencyFormat?: string;
    decimalPrecision: number;
    financialYearStart: number;
    defaultTaxProfileId?: string;
    defaultNumberingProfileId?: string;
}

export interface OrganizationFinancialSettingsResponseDTO {
    id: string;
    organizationId: string;
    country: string;
    timeZone: string;
    defaultLanguage: string;
    dateFormat: string;
    numberFormat: string;
    currencyFormat: string;
    decimalPrecision: number;
    financialYearStart: number;
    defaultTaxProfileId?: string;
    defaultNumberingProfileId?: string;
}
