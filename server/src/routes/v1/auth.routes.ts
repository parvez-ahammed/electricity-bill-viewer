import { AuthController } from '@controllers/v1/AuthController';
import { authMiddleware } from '@middlewares/AuthMiddleware';
import { Router } from 'express';

const router = Router();
const authController = new AuthController();

// Google OAuth routes
router.get('/google', authController.googleLogin);
router.get('/google/callback', authController.googleCallback);

// Protected routes
router.get('/me', authMiddleware, authController.getCurrentUser);
router.post('/logout', authController.logout);

export default router;
