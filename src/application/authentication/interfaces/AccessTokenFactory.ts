import { AuthenticationContext } from '../models/AuthenticationContext';

export interface AccessTokenFactory {
    create(context: AuthenticationContext): Promise<string>;
}
