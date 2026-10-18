import { TrialBalance } from '../aggregates/TrialBalance';
import { TrialBalanceId } from '../valueobjects/TrialBalanceId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export interface ITrialBalanceRepository {
    save(trialBalance: TrialBalance): Promise<void>;
    findById(id: TrialBalanceId, organizationId: OrganizationId): Promise<TrialBalance | null>;
    findByOrganization(organizationId: OrganizationId): Promise<TrialBalance[]>;
}
