import { Router } from 'express';
import { AccountController } from '../../controllers/v1/AccountController';

const router = Router();
const accountController = new AccountController();

// CRUD operations
router.post('/', accountController.createAccount);
router.get('/', accountController.getAllAccounts);
router.get('/:id', accountController.getAccountById);
router.put('/:id', accountController.updateAccount);
router.delete('/:id', accountController.deleteAccount);

// Get accounts by provider
router.get('/provider/:provider', accountController.getAccountsByProvider);

export default router;