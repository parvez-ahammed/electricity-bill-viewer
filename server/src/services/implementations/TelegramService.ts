import { appConfig } from '@configs/config';
import logger from '@helpers/Logger';
import { ProviderAccountDetails } from '@interfaces/Shared';
import { Account } from '../../entities/Account';
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
            logger.info('Preparing to send account balances to Telegram');

            // 1. Fetch all accounts from DB
            const allAccounts = await this.accountService.getAllAccounts();
            
            if (allAccounts.length === 0) {
                logger.warn('No accounts configured in database');
                return {
                    success: false,
                    message: 'No accounts configured',
                    error: 'NO_ACCOUNTS',
                };
            }

            // 2. Map for easy lookup [provider_username] -> Account
            const accountMap = new Map<string, Account>();
            const credentials = [];
            
            for (const account of allAccounts) {
                const key = `${account.provider}_${account.credentials.username}`;
                accountMap.set(key, account);
                
                credentials.push({
                    username: account.credentials.username,
                    password: 'password' in account.credentials ? account.credentials.password : undefined,
                    clientSecret: 'clientSecret' in account.credentials ? account.credentials.clientSecret : undefined,
                    provider: account.provider,
                });
            }

            // 3. Fetch usage data
            logger.debug(`Invoking ElectricityService.getUsageData(skipCache=${skipCache})`);
            const usageResult = await this.electricityService.getUsageData(credentials, skipCache);
            logger.info(`Fetched account data: ${usageResult.accounts.length} accounts (successful)`);

            if (usageResult.accounts.length === 0) {
                logger.warn('No account data retrieved from providers');
                return {
                    success: false,
                    message: 'No account data retrieved',
                    error: 'All accounts failed to fetch',
                };
            }

            // 4. Group data by Chat ID
            // We need to fetch settings for matched accounts
            const messagesByChatId = new Map<string, ProviderAccountDetails[]>();

            for (const data of usageResult.accounts) {
                const key = `${data.provider}_${data.customerNumber}`; // ProviderAccountDetails uses customerNumber
                
                // Fallback matching if accountNo is missing or different format (usually it matches username)
                // Assuming accountNo from provider matches username in credentials
                
                const account = accountMap.get(key);
                if (account) {
                    const settings = await this.notificationSettingsService.getTelegramSettings(account.id);
                    if (settings && settings.isActive && settings.chatId) {
                        if (!messagesByChatId.has(settings.chatId)) {
                            messagesByChatId.set(settings.chatId, []);
                        }
                        messagesByChatId.get(settings.chatId)?.push(data);
                    }
                } else {
                    logger.warn(`Could not find matching DB account for provider data: ${key}`);
                }
            }

            // 5. Send messages
            let sentCount = 0;
            const errors: string[] = [];

            if (messagesByChatId.size === 0) {
                 logger.info('No active Telegram notifications configured for the fetched accounts.');
                 return {
                     success: true,
                     message: 'No active notifications configured',
                     sentAccounts: 0
                 };
            }

            for (const [chatId, accounts] of messagesByChatId.entries()) {
                const message = this.formatAccountMessage(accounts);
                const success = await this.sendMessage(message, chatId);
                if (success) {
                    sentCount += accounts.length;
                } else {
                    errors.push(`Failed to send to ${chatId}`);
                }
            }

            if (errors.length > 0) {
                 logger.warn(`Some Telegram messages failed: ${errors.join(', ')}`);
            }

            return {
                success: true,
                message: `Sent notifications for ${sentCount} accounts to ${messagesByChatId.size} recipients`,
                sentAccounts: sentCount,
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
}
