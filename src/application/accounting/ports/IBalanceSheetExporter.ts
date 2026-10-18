import { BalanceSheetDTO } from '../dtos/BalanceSheetDTOs';

export interface IBalanceSheetExporter {
    exportToCsv(data: BalanceSheetDTO): Promise<Buffer>;
    exportToPdf(data: BalanceSheetDTO): Promise<Buffer>;
}
