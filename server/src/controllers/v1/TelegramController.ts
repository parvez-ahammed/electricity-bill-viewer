import ApiError from '@helpers/ApiError';
import logger from '@helpers/Logger';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
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
                'Telegram service not configured: ' +
                    (error instanceof Error ? error.message : 'Unknown error')
            );
        }
    }

    sendBalances = async (req: Request, res: Response): Promise<void> => {
        const userId = this.getValidatedUserId(req);

        if (!this.telegramService) {
            throw new ApiError(
                httpStatus.SERVICE_UNAVAILABLE,
                'Telegram service not configured. Please set TELEGRAM_BOT_TOKEN environment variable.'
            );
        }

        const skipCache = req.headers['x-skip-cache'] === 'true';

        const result = await this.telegramService.sendUserAccountBalance(userId, skipCache);

        if (result.success) {
            this.ok(res, result, result.message);
        } else {
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, result.error || result.message);
        }
    };
}
