export interface LoginRequestDTO {
    email: string;
    passwordPlain: string;
}

export interface RefreshRequestDTO {
    sessionId: string;
}
