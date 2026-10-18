import { BranchName } from '../../shared/valueobjects/BranchName';
import { BranchAddress } from '../../shared/valueobjects/BranchAddress';
import { BranchPhone } from '../../shared/valueobjects/BranchPhone';
import { BranchEmail } from '../../shared/valueobjects/BranchEmail';

export enum BranchStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    ARCHIVED = 'ARCHIVED'
}

export enum BranchType {
    HEADQUARTERS = 'HEADQUARTERS',
    REGIONAL = 'REGIONAL',
    LOCAL = 'LOCAL'
}

export interface BranchProfile {
    name: BranchName;
    address: BranchAddress;
    phone?: BranchPhone;
    email?: BranchEmail;
}

export interface BranchSettings {
    type: BranchType;
    operatingHours?: string;
    timezone?: string;
}
