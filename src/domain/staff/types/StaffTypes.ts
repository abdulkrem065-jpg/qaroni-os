import { JobTitle } from '../../shared/valueobjects/JobTitle';
import { EmployeeNumber } from '../../shared/valueobjects/EmployeeNumber';
import { EmploymentDate } from '../../shared/valueobjects/EmploymentDate';

export enum EmploymentStatus {
    ACTIVE = 'ACTIVE',
    SUSPENDED = 'SUSPENDED',
    ARCHIVED = 'ARCHIVED'
}

export interface StaffProfile {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
}

export interface StaffEmployment {
    employeeNumber: EmployeeNumber;
    jobTitle: JobTitle;
    hireDate: EmploymentDate;
    terminationDate?: EmploymentDate;
}
