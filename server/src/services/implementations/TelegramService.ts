import { appConfig } from '@configs/config';
import logger from '@helpers/Logger';
import { ProviderAccountDetails } from '@interfaces/Shared';
import { ITelegramService } from '../interfaces/ITelegramService';
import { AccountService } from './AccountService';
import { ElectricityService } from './ElectricityService';
import { NotificationSettingsService } from './NotificationSettingsService';

export class TelegramService implements ITelegramService {
    private readonly botToken: string;
    private readonly electricityService: ElectricityService;
    private readonly accountService: AccountService;
    private readonly notificationSettingsService: NotificationSettingsService;
    private readonly baseUrl = 'https://api.telegram.org';

    constructor() {
        if (!appConfig.telegram.botToken) {
            throw new Error(
                'Telegram bot token is required. Set TELEGRAM_BOT_TOKEN environment variable.'
            );
        }

        this.botToken = appConfig.telegram.botToken;
        this.electricityService = new ElectricityService();
        this.accountService = new AccountService();
        this.notificationSettingsService = new NotificationSettingsService();
        
        try {
            const masked = this.botToken
                ? `****${this.botToken.slice(-4)}`
                : 'none';
            logger.info(
                `TelegramService initialized (botTokenSuffix=${masked})`
            );
        } catch (err) {
            logger.debug(
                'TelegramService initialization logging failed: ' +
                    (err instanceof Error ? err.message : String(err))
            );
        }
    }

    async sendMessage(message: string, chatId: string): Promise<boolean> {
        try {
            const url = `${this.baseUrl}/bot${this.botToken}/sendMessage`;
            logger.debug(
                `Sending Telegram message to chatId=${chatId} (messageLength=${message.length})`
            );

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'HTML',
                }),
            });

            if (!response.ok) {
                let errorBody: unknown = null;
                try {
                    errorBody = await response.json();
                } catch {
                    try {
                        errorBody = await response.text();
                    } catch {
                        errorBody = null;
                    }
                }
                logger.error(
                    `Telegram API responded with status ${response.status}: ${JSON.stringify(errorBody)}`
                );
                // Don't throw here, just return false to allow other messages to proceed
                return false;
            }

            logger.info(`Telegram message sent to chatId=${chatId}`);
            return true;
        } catch (error) {
            logger.error(
                'Failed to send Telegram message:' +
                    (error instanceof Error ? error.message : String(error))
            );
            return false;
        }
    }

    formatAccountMessage(accounts: ProviderAccountDetails[]): string {
        try {
            logger.debug(
                `Formatting Telegram message for ${accounts.length} accounts`
            );
        } catch (err) {
            logger.debug(
                'Failed to log formatAccountMessage details: ' +
                    (err instanceof Error ? err.message : String(err))
            );
        }
        const timestamp = new Date().toLocaleString('en-US', {
            timeZone: 'Asia/Dhaka',
            dateStyle: 'full',
            timeStyle: 'short',
        });

        let message = `⚡ <b>Electricity Account Balances</b> ⚡\n`;
        message += `📅 ${timestamp}\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        const groupedByProvider = accounts.reduce(
            (acc, account) => {
                const provider = account.provider || 'Unknown';
                if (!acc[provider]) {
                    acc[provider] = [];
                }
                acc[provider].push(account);
                return acc;
            },
            {} as Record<string, ProviderAccountDetails[]>
        );

        for (const [provider, providerAccounts] of Object.entries(
            groupedByProvider
        )) {
            const emoji =
                provider === 'DPDC' ? '🔵' : provider === 'NESCO' ? '🟢' : '🟣';

            message += `${emoji} <b>${provider}</b>\n`;
            message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

            providerAccounts.forEach((account, index) => {
                message += `\n<b>${account.customerName || 'N/A'}</b>\n`;
                message += `💰 Balance: <b>৳${account.balanceRemaining || '0'}</b>\n`;
                message += `📅 Updated: ${account.balanceLatestDate || 'N/A'}\n`;

                if (index < providerAccounts.length - 1) {
                    message += `\n`;
                }
            });

            message += `\n`;
        }

        return message;
    }

    async sendAccountBalances(skipCache = false): Promise<{
        success: boolean;
        message: string;
        sentAccounts?: number;
        error?: string;
    }> {
        try {
            logger.info('Preparing to send user-scoped account balances to Telegram');

            // 1. Fetch all active notification settings
            const activeSettings = await this.notificationSettingsService.getAllActiveSettings();
            
            if (activeSettings.length === 0) {
                logger.info('No active Telegram notification settings found');
                return {
                    success: true,
                    message: 'No active notifications configured',
                    sentAccounts: 0,
                };
            }

            logger.info(`Found ${activeSettings.length} active notification settings. Processing...`);

            let totalSentAccounts = 0;
            let successCount = 0;
            let failureCount = 0;

            // 2. Iterate through each user setting
            for (const settings of activeSettings) {
                if (!settings.chatId || !settings.userId) {
                    logger.warn(`Skipping invalid settings (missing chatId or userId): ID=${settings.id}`);
                    continue;
                }

                try {
                    // 3. Fetch accounts for this specific user
                    const userAccounts = await this.accountService.getAllAccounts(settings.userId);

                    if (userAccounts.length === 0) {
                        logger.debug(`User ${settings.userId} has no accounts. Skipping.`);
                        continue;
                    }

                    // 4. Map credentials
                    const credentials = userAccounts.map(account => ({
                        username: account.credentials.username,
                        password: 'password' in account.credentials ? account.credentials.password : undefined,
                        clientSecret: 'clientSecret' in account.credentials ? account.credentials.clientSecret : undefined,
                        provider: account.provider,
                    }));

                    // 5. Fetch usage data
                    const usageResult = await this.electricityService.getUsageData(credentials, skipCache);

                    if (usageResult.accounts.length === 0) {
                        logger.warn(`User ${settings.userId}: No account data retrieved.`);
                        continue;
                    }

                    // 6. Send user-specific message
                    const message = this.formatAccountMessage(usageResult.accounts);
                    const sent = await this.sendMessage(message, settings.chatId);

                    if (sent) {
                        totalSentAccounts += usageResult.accounts.length;
                        successCount++;
                        logger.info(`Sent ${usageResult.accounts.length} accounts to user ${settings.userId} on chat ${settings.chatId}`);
                    } else {
                        failureCount++;
                        logger.error(`Failed to send message to user ${settings.userId}`);
                    }
                } catch (err) {
                    failureCount++;
                    logger.error(`Error processing user ${settings.userId}: ${err}`);
                }
            }

            return {
                success: true,
                message: `Processed ${activeSettings.length} users. Sent ${totalSentAccounts} accounts. Success: ${successCount}, Fail: ${failureCount}.`,
                sentAccounts: totalSentAccounts,
            };

        } catch (error) {
            logger.error(
                'Failed to send account balances: ' +
                    (error instanceof Error ? error.message : String(error))
            );
            return {
                success: false,
                message: 'Failed to send account balances',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    async sendUserAccountBalance(userId: string, skipCache = false): Promise<{
        success: boolean;
        message: string;
        sentAccounts?: number;
        error?: string;
    }> {
        try {
            logger.info(`Preparing to send account balances specifically for user ${userId}`);

            const settings = await this.notificationSettingsService.getTelegramSettings(userId);
            
            if (!settings) {
                return {
                    success: false,
                    message: 'Telegram notifications not configured for this user',
                    error: 'NOT_CONFIGURED',
                };
            }

            if (!settings.chatId) {
                return {
                    success: false,
                    message: 'Telegram Chat ID not configured',
                    error: 'NO_CHAT_ID',
                };
            }

            // User might have disabled notifications, but manual trigger implies intent?
            // Let's allow manual trigger even if isActive is false, or enforce it?
            // Usually manual trigger overrides "schedule" active flag.
            
            const userAccounts = await this.accountService.getAllAccounts(userId);

            if (userAccounts.length === 0) {
                return {
                    success: false,
                    message: 'No accounts configured',
                    error: 'NO_ACCOUNTS',
                };
            }

            const credentials = userAccounts.map(account => ({
                username: account.credentials.username,
                password: 'password' in account.credentials ? account.credentials.password : undefined,
                clientSecret: 'clientSecret' in account.credentials ? account.credentials.clientSecret : undefined,
                provider: account.provider,
            }));

            const usageResult = await this.electricityService.getUsageData(credentials, skipCache);

            if (usageResult.accounts.length === 0) {
                return {
                    success: false,
                    message: 'No account data retrieved',
                    error: 'All accounts failed to fetch',
                };
            }

            const message = this.formatAccountMessage(usageResult.accounts);
            const sent = await this.sendMessage(message, settings.chatId);

            if (!sent) {
                return {
                    success: false,
                    message: 'Failed to send message to Telegram',
                    error: 'Telegram API request failed',
                };
            }

            return {
                success: true,
                message: `Sent notifications for ${usageResult.accounts.length} accounts`,
                sentAccounts: usageResult.accounts.length,
            };

        } catch (error) {
             return {
                success: false,
                message: 'Failed to send account balances',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
}
