import { Router } from 'express';
import { AccountController } from '../../controllers/v1/AccountController';
import { validate } from '../../middlewares/ValidationMiddleware';
import {
    accountParamsValidation,
    createAccountValidation,
    providerParamsValidation,
    updateAccountValidation
} from '../../schemas/AccountSchemas';

const router = Router();
const accountController = new AccountController();

// CRUD operations
router.post('/', validate(createAccountValidation), accountController.createAccount);
router.get('/', accountController.getAllAccounts);
router.get('/:id', validate(accountParamsValidation), accountController.getAccountById);
router.put('/:id', validate(updateAccountValidation), accountController.updateAccount);
router.delete('/:id', validate(accountParamsValidation), accountController.deleteAccount);

// Force delete corrupted accounts
router.delete('/:id/force', validate(accountParamsValidation), accountController.forceDeleteAccount);

// Get accounts by provider
router.get('/provider/:provider', validate(providerParamsValidation), accountController.getAccountsByProvider);

// Nickname management
router.put('/:accountId/nickname', accountController.setAccountNickname);
router.get('/:accountId/nickname', accountController.getAccountNickname);
router.delete('/:accountId/nickname', accountController.deleteAccountNickname);

export default router;