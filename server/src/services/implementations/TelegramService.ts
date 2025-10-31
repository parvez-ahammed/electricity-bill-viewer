import { appConfig } from '@configs/config';
import logger from '@helpers/Logger';
import { ProviderAccountDetails } from '@interfaces/Shared';
import { getCredentialsFromDatabase } from '@utility/accountCredentialParser';
import { ITelegramService } from '../interfaces/ITelegramService';
import { ElectricityService } from './ElectricityService';

export class TelegramService implements ITelegramService {
    private readonly botToken: string;
    private readonly chatId: string;
    private readonly electricityService: ElectricityService;
    private readonly baseUrl = 'https://api.telegram.org';

    constructor() {
        if (!appConfig.telegram.botToken || !appConfig.telegram.chatId) {
            throw new Error(
                'Telegram bot token and chat ID are required. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables.'
            );
        }

        this.botToken = appConfig.telegram.botToken;
        this.chatId = appConfig.telegram.chatId;
        this.electricityService = new ElectricityService();
        try {
            const masked = this.botToken
                ? `****${this.botToken.slice(-4)}`
                : 'none';
            logger.info(
                `TelegramService initialized (chatId=${this.chatId}, botTokenSuffix=${masked})`
            );
        } catch (err) {
            logger.debug(
                'TelegramService initialization logging failed: ' +
                    (err instanceof Error ? err.message : String(err))
            );
        }
    }

    async sendMessage(message: string): Promise<boolean> {
        try {
            const url = `${this.baseUrl}/bot${this.botToken}/sendMessage`;
            logger.debug(
                `Sending Telegram message to chatId=${this.chatId} (messageLength=${message.length})`
            );

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: this.chatId,
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
                throw new Error(
                    `Telegram API error: ${JSON.stringify(errorBody)}`
                );
            }

            logger.info(`Telegram message sent to chatId=${this.chatId}`);
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

            // Get credentials
            const credentials = await getCredentialsFromDatabase();
            logger.debug(
                `Found ${credentials.length} credential(s) from environment`
            );

            if (credentials.length === 0) {
                logger.warn(
                    'No credentials configured for electricity accounts'
                );
                return {
                    success: false,
                    message: 'No credentials configured',
                    error: 'ELECTRICITY_CREDENTIALS is empty',
                };
            }

            // Fetch account data with skipCache parameter
            logger.debug(
                `Invoking ElectricityService.getUsageData(skipCache=${skipCache})`
            );
            const result = await this.electricityService.getUsageData(
                credentials,
                skipCache
            );
            logger.info(
                `Fetched account data: ${result.accounts.length} accounts (successful)`
            );
            logger.debug(
                'getUsageData result summary: ' +
                    JSON.stringify({
                        accounts: result.accounts.length,
                        errors: result.errors?.length ?? 0,
                    })
            );

            if (result.accounts.length === 0) {
                logger.warn('No account data retrieved from providers');
                return {
                    success: false,
                    message: 'No account data retrieved',
                    error: 'All accounts failed to fetch',
                };
            }

            // Format message
            const message = this.formatAccountMessage(result.accounts);

            // Send to Telegram
            const sent = await this.sendMessage(message);

            if (!sent) {
                logger.error('Telegram sendMessage returned false');
                return {
                    success: false,
                    message: 'Failed to send message to Telegram',
                    error: 'Telegram API request failed',
                };
            }

            logger.info(
                `Account balances sent to Telegram successfully. Accounts sent: ${result.accounts.length}`
            );
            return {
                success: true,
                message: 'Account balances sent to Telegram successfully',
                sentAccounts: result.accounts.length,
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
