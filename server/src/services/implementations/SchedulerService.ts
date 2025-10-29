import logger from '@helpers/Logger';
import cron, { ScheduledTask } from 'node-cron';
import { TelegramService } from './TelegramService';

export class SchedulerService {
    private telegramService: TelegramService | null = null;
    private scheduledTask: ScheduledTask | null = null;

    constructor() {
        try {
            this.telegramService = new TelegramService();
        } catch (error) {
            logger.error(error);
        }
    }

    startDailyBalanceNotification(): void {
        if (!this.telegramService) {
            logger.warn(
                'Cannot start scheduled balance notifications: Telegram service not configured'
            );
            return;
        }

        // Schedule for 12:00 PM BST (Bangladesh Standard Time)
        // '0 12 * * *' = At 12:00 PM every day
        this.scheduledTask = cron.schedule(
            '0 12 * * *',
            async () => {
                logger.info(
                    '⏰ Running scheduled balance notification at 12:00 PM BST...'
                );
                try {
                    const result =
                        await this.telegramService!.sendAccountBalances(true); // skipCache = true for fresh data

                    if (result.success) {
                        logger.info(
                            `✅ Scheduled balance notification sent successfully. Accounts: ${result.sentAccounts}`
                        );
                    } else {
                        logger.error(
                            `❌ Scheduled balance notification failed: ${result.error || result.message}`
                        );
                    }
                } catch (error) {
                    const errorMsg =
                        error instanceof Error
                            ? error.message
                            : 'Unknown error';
                    logger.error(
                        `Error in scheduled balance notification: ${errorMsg}`
                    );
                }
            },
            {
                timezone: 'Asia/Dhaka', // Bangladesh Standard Time (BST = UTC+6)
            }
        );

        logger.info(
            '⏰ Scheduled daily balance notifications at 12:00 PM BST (Asia/Dhaka timezone)'
        );
    }

    stop(): void {
        if (this.scheduledTask) {
            this.scheduledTask.stop();
            logger.info('Stopped scheduled balance notifications');
        }
    }
}

let schedulerInstance: SchedulerService | null = null;

export function initializeScheduler(): SchedulerService {
    if (!schedulerInstance) {
        schedulerInstance = new SchedulerService();
    }
    return schedulerInstance;
}
