import UserController from '@controllers/v1/UserController';
import { authentication } from '@middlewares/Authentication';
import { authorization } from '@middlewares/Authorization';
import { validate } from '@middlewares/ValidationMiddleware';
import { Router } from 'express';
import {
    createUserSchema,
    deleteUserSchema,
    getUserByIdSchema,
    updateUserSchema,
} from 'src/schemas/UserSchemas';

const router = Router();

const userController = new UserController();
router
    .route('/')
    .post(validate(createUserSchema), userController.createUser)
    .get(userController.getAllUsers);

router.route('/username/:username').get(userController.getUserByUsername);

router
    .route('/:id')
    .get(validate(getUserByIdSchema), userController.getUserById)
    .patch(
        authentication(),
        authorization(),
        validate(updateUserSchema),
        userController.updateUser
    )
    .delete(
        authentication(),
        authorization(),
        validate(deleteUserSchema),
        userController.deleteUser
    );

export default router;
