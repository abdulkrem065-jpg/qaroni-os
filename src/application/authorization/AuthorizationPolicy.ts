import { AuthorizationContext } from './AuthorizationContext';
import { Permission } from '../../domain/iam/entities/Permission';

export interface AuthorizationPolicy {
    readonly name: string;
    evaluate(context: AuthorizationContext, effectivePermissions: Permission[]): boolean;
}
