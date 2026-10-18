export interface CreateSupplierDto {
    code: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    taxNumber: string;
    commercialRegistration: string;
}

export interface UpdateSupplierDto {
    name: string;
    phone: string;
    email: string;
    address: string;
    taxNumber: string;
    commercialRegistration: string;
}
