import { TelegramController } from '@controllers/v1/TelegramController';
import { Router } from 'express';

const telegramRoute = Router();
const telegramController = new TelegramController();

/**
 * @route GET /api/v1/telegram/send-balances
 * @description Sends electricity account balances to configured Telegram chat
 * @access Public
 */
telegramRoute.get('/send-balances', telegramController.sendBalances);

/**
 * @route GET /api/v1/telegram/test
 * @description Tests Telegram bot configuration
 * @access Public
 */
telegramRoute.get('/test', telegramController.testConnection);

export default telegramRoute;
