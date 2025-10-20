import AuthController from '@controllers/v1/AuthController';
import UserController from '@controllers/v1/UserController';
import { authentication } from '@middlewares/Authentication';
import { authorization } from '@middlewares/Authorization';
import { validate } from '@middlewares/ValidationMiddleware';
import { Router } from 'express';
import {
    loginWithEmailPasswordSchema,
    registerUserSchema,
    updatePasswordSchema,
} from 'src/schemas/AuthSchemas';

const router = Router();

const authController = new AuthController();
const userController = new UserController();

router
    .route('/register')
    .post(validate(registerUserSchema), userController.createUser);

router
    .route('/login')
    .post(
        validate(loginWithEmailPasswordSchema),
        authController.loginWithEmailPassword
    );

router
    .route('/update-password')
    .patch(
        validate(updatePasswordSchema),
        authentication(),
        authorization(),
        authController.updatePassword
    );

export default router;
