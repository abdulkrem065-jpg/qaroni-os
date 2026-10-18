import { AuthenticationContext } from '../models/AuthenticationContext';

export interface ITokenValidator {
    validate(token: string): Promise<AuthenticationContext>;
}
