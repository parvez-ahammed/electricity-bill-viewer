import logger from '@helpers/Logger';
import cron, { ScheduledTask } from 'node-cron';
import { TelegramService } from './TelegramService';

export class SchedulerService {
    private telegramService: TelegramService | null = null;
    private scheduledTask: ScheduledTask | null = null;

    constructor() {
        try {
            this.telegramService = new TelegramService();
            logger.info(
                'SchedulerService initialized and TelegramService instantiated'
            );
        } catch (error) {
            logger.error(
                'Failed to initialize TelegramService in SchedulerService: ' +
                    (error instanceof Error ? error.message : String(error))
            );
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
        const cronExpression = '0 12 * * *';
        logger.debug(
            `Scheduling daily balance notification with cron expression: ${cronExpression} (Asia/Dhaka)`
        );

        this.scheduledTask = cron.schedule(
            cronExpression,
            async () => {
                logger.info(
                    '⏰ Running scheduled balance notification at 12:00 PM BST...'
                );
                logger.debug(
                    'Scheduled task invocation - fetching account balances (skipCache = true)'
                );

                try {
                    const result =
                        await this.telegramService!.sendAccountBalances(true); // skipCache = true for fresh data

                    logger.debug(
                        'Scheduled sendAccountBalances result: ' +
                            JSON.stringify({
                                success: result.success,
                                sentAccounts: result.sentAccounts,
                                error: result.error,
                            })
                    );

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
            logger.debug('Stopping scheduled balance notifications');
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
