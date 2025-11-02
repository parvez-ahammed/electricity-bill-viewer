import logger from '@helpers/Logger';
import { ResponseBuilder } from '@helpers/ResponseBuilder';
import { Request, Response } from 'express';
import { TelegramService } from '../../services/implementations/TelegramService';

export class TelegramController {
    private telegramService: TelegramService | null;

    constructor() {
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
        try {
            if (!this.telegramService) {
                new ResponseBuilder(res)
                    .setStatus(500)
                    .setMessage(
                        'Telegram service not configured. Please set TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID environment variables.'
                    )
                    .sendError();
                return;
            }

            const skipCache = req.headers['x-skip-cache'] === 'true';

            const result =
                await this.telegramService.sendAccountBalances(skipCache);

            if (result.success) {
                new ResponseBuilder(res)
                    .setStatus(200)
                    .setMessage(result.message)
                    .setData(result)
                    .send();
            } else {
                new ResponseBuilder(res)
                    .setStatus(500)
                    .setMessage(result.error || result.message)
                    .setData(result)
                    .sendError();
            }
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error ? error.message : 'Unknown error';
            new ResponseBuilder(res)
                .setStatus(500)
                .setMessage(
                    `Failed to send balances to Telegram: ${errorMessage}`
                )
                .sendError();
        }
    };
}
