export interface SessionResponseDTO {
    id: string;
    userId: string;
    issuedAt: Date;
    expiresAt: Date;
    isRevoked: boolean;
    isValid: boolean;
}

import { Session } from '../../../../domain/iam/entities/Session';

export class SessionMapper {
    public static toDTO(session: Session): SessionResponseDTO {
        return {
            id: session.id.value,
            userId: session.userId.value,
            issuedAt: session.issuedAt,
            expiresAt: session.expiresAt,
            isRevoked: session.isRevoked,
            isValid: session.isValid()
        };
    }
}
