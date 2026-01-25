import logger from '@helpers/Logger';
import { AuthenticatedRequest } from '@interfaces/Auth';
import { Request, Response } from 'express';
import { TelegramService } from '../../services/implementations/TelegramService';
import { BaseController } from '../BaseController';

export class TelegramController extends BaseController {
    private telegramService: TelegramService | null;

    constructor() {
        super();
        try {
            this.telegramService = new TelegramService();
        } catch (error) {
            this.telegramService = null;
            logger.warn(
                'Telegram service not configured:' +
                    (error instanceof Error
                        ? error.message
                        : 'Unknown error')
            );
        }
    }

    sendBalances = async (req: Request, res: Response): Promise<void> => {
        await this.handleRequest(res, async () => {
             // Cast to AuthenticatedRequest to access user
            const authReq = req as AuthenticatedRequest;
            
            const userId = this.validateUser(authReq, res);
            if (!userId) return;

            if (!this.telegramService) {
                this.fail(res, new Error('Telegram service not configured. Please set TELEGRAM_BOT_TOKEN environment variable.'));
                return;
            }

            const skipCache = req.headers['x-skip-cache'] === 'true';

            const result =
                await this.telegramService.sendUserAccountBalance(userId, skipCache);

            if (result.success) {
                this.ok(res, result, result.message);
            } else {
                this.fail(res, new Error(result.error || result.message));
            }
        });
    };
}
