import { TelegramController } from '@controllers/v1/TelegramController';
import { Router } from 'express';

const telegramRoute = Router();
const telegramController = new TelegramController();

telegramRoute.get('/send-balances', telegramController.sendBalances);

export default telegramRoute;
