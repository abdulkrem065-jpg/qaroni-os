import { AuthenticationContext } from '../models/AuthenticationContext';

export interface RefreshTokenFactory {
    create(context: AuthenticationContext): Promise<string>;
}
