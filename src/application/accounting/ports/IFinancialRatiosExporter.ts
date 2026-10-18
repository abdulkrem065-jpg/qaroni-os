import { FinancialRatios } from '../../../domain/accounting/aggregates/FinancialRatios';

export interface IFinancialRatiosExporter {
    exportToPDF(ratios: FinancialRatios): Promise<Buffer>;
    exportToCSV(ratios: FinancialRatios): Promise<Buffer>;
}
