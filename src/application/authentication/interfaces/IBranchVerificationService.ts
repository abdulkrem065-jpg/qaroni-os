export interface IBranchVerificationService {
    isBranchActive(branchId: string): Promise<boolean>;
}
