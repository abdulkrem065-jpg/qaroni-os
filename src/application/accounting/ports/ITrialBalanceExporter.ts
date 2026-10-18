import { TrialBalanceDTO } from '../dtos/TrialBalanceDTOs';

export interface ITrialBalanceExporter {
    exportToCsv(data: TrialBalanceDTO): Promise<Buffer>;
    exportToPdf(data: TrialBalanceDTO): Promise<Buffer>;
}
