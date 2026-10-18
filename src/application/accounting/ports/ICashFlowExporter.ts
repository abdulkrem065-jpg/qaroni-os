import { CashFlowStatementDTO } from '../dtos/CashFlowDTOs';
export interface ICashFlowExporter {
    exportToPDF(cashFlow: CashFlowStatementDTO): Promise<Buffer>;
    exportToCSV(cashFlow: CashFlowStatementDTO): Promise<Buffer>;
}
