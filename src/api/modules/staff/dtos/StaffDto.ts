export interface CreateStaffDto {
    branchId: string;
    profile: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
    };
    employment: {
        employeeNumber: string;
        jobTitle: string;
        hireDate: string;
    };
}

export interface UpdateStaffDto {
    profile?: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
    };
    employment?: {
        employeeNumber: string;
        jobTitle: string;
        hireDate: string;
        terminationDate?: string;
    };
}

export interface TransferStaffDto {
    newBranchId: string;
}

export interface AssignRoleDto {
    roleId: string;
}
