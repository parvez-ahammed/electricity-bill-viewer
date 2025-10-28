import logger from '@helpers/Logger';
import { ResponseBuilder } from '@helpers/ResponseBuilder';
import { Request, Response } from 'express';
import { TelegramService } from '../../services/implementations/TelegramService';

export class TelegramController {
    private static telegramService: TelegramService | null;

    constructor() {
        if (TelegramController.telegramService === undefined) {
            try {
                TelegramController.telegramService = new TelegramService();
            } catch (error) {
                // Service will be null if not configured
                TelegramController.telegramService = null;
                logger.warn(
                    'Telegram service not configured:' +
                        (error instanceof Error
                            ? error.message
                            : 'Unknown error')
                );
            }
        }
    }

    private get telegramService(): TelegramService | null {
        return TelegramController.telegramService;
    }

    /**
     * GET /api/v1/telegram/send-balances
     * Sends electricity account balances to configured Telegram chat
     */
    sendBalances = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!this.telegramService) {
                new ResponseBuilder(res)
                    .setStatus(500)
                    .setMessage(
                        'Telegram service not configured. Please set TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, and ELECTRICITY_CREDENTIALS environment variables.'
                    )
                    .sendError();
                return;
            }

            // Check for x-skip-cache header
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

    /**
     * GET /api/v1/telegram/test
     * Tests Telegram bot configuration by sending a test message
     */
    testConnection = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!this.telegramService) {
                new ResponseBuilder(res)
                    .setStatus(500)
                    .setMessage(
                        'Telegram service not configured. Please set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables.'
                    )
                    .sendError();
                return;
            }

            const testMessage = `🤖 <b>Telegram Bot Test</b>\n\n✅ Connection successful!\n📅 ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })}`;

            const sent = await this.telegramService.sendMessage(testMessage);

            if (sent) {
                new ResponseBuilder(res)
                    .setStatus(200)
                    .setMessage('Test message sent to Telegram successfully')
                    .setData({ sent: true })
                    .send();
            } else {
                new ResponseBuilder(res)
                    .setStatus(500)
                    .setMessage('Failed to send test message to Telegram')
                    .sendError();
            }
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error ? error.message : 'Unknown error';
            new ResponseBuilder(res)
                .setStatus(500)
                .setMessage(
                    `Failed to test Telegram connection: ${errorMessage}`
                )
                .sendError();
        }
    };
}
