import { BranchDto } from './BranchDto';

export interface BranchListResponse {
    branches: BranchDto[];
}

export interface BranchResponse {
    branch: BranchDto;
}
