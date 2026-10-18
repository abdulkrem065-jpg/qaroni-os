import { IncomeStatementDTO } from '../dtos/IncomeStatementDTOs';
export interface IIncomeStatementExporter {
    exportToPDF(incomeStatement: IncomeStatementDTO): Promise<Buffer>;
    exportToCSV(incomeStatement: IncomeStatementDTO): Promise<Buffer>;
}
