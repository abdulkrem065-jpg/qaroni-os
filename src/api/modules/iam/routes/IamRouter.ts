import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { UserController } from '../controllers/UserController';
import { RoleController } from '../controllers/RoleController';
import { PermissionController } from '../controllers/PermissionController';
import { SessionController } from '../controllers/SessionController';
import { SecurityPipeline } from '../../../security/SecurityPipeline';

export class IamRouter {
    public static create(
        securityPipeline: SecurityPipeline,
        authController: AuthController,
        userController: UserController,
        roleController: RoleController,
        permissionController: PermissionController,
        sessionController: SessionController
    ): Router {
        const router = Router();

        // 1. Authentication Endpoints
        router.post('/auth/login', authController.login); // Open
        router.post('/auth/refresh', authController.refresh); // Open
        
        router.post('/auth/logout', ...securityPipeline.buildAuthenticatedRoute(), authController.logout);
        router.get('/auth/me', ...securityPipeline.buildAuthenticatedRoute(), authController.getMe);

        // 2. User Endpoints
        router.get('/users', ...securityPipeline.buildSecureRoute('read', 'users'), userController.list);
        router.get('/users/:id', ...securityPipeline.buildSecureRoute('read', 'users'), userController.getById);
        router.post('/users', ...securityPipeline.buildSecureRoute('create', 'users'), userController.create);
        router.put('/users/:id', ...securityPipeline.buildSecureRoute('update', 'users'), userController.update);
        router.delete('/users/:id', ...securityPipeline.buildSecureRoute('delete', 'users'), userController.delete);

        // 3. Role Endpoints
        router.get('/roles', ...securityPipeline.buildSecureRoute('read', 'roles'), roleController.list);
        router.post('/roles', ...securityPipeline.buildSecureRoute('create', 'roles'), roleController.create);
        router.put('/roles/:id', ...securityPipeline.buildSecureRoute('update', 'roles'), roleController.update);
        router.delete('/roles/:id', ...securityPipeline.buildSecureRoute('delete', 'roles'), roleController.delete);

        // 4. Permission Endpoints
        router.get('/permissions', ...securityPipeline.buildSecureRoute('read', 'permissions'), permissionController.list);
        router.post('/permissions', ...securityPipeline.buildSecureRoute('create', 'permissions'), permissionController.create);
        router.delete('/permissions/:id', ...securityPipeline.buildSecureRoute('delete', 'permissions'), permissionController.delete);

        // 5. Session Endpoints
        router.get('/sessions', ...securityPipeline.buildSecureRoute('read', 'sessions'), sessionController.list);
        router.delete('/sessions/:id', ...securityPipeline.buildSecureRoute('delete', 'sessions'), sessionController.delete);

        return router;
    }
}
