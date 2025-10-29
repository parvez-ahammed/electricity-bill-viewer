import { appConfig } from '@configs/config';
import logger from '@helpers/Logger';
import { ProviderAccountDetails } from '@interfaces/Shared';
import { getCredentialsFromEnv } from '../../utility/credentialParser';
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
    }

    async sendMessage(message: string): Promise<boolean> {
        try {
            const url = `${this.baseUrl}/bot${this.botToken}/sendMessage`;

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
                const error = await response.json();
                throw new Error(`Telegram API error: ${JSON.stringify(error)}`);
            }

            return true;
        } catch (error) {
            logger.error('Failed to send Telegram message:' + error);
            return false;
        }
    }

    formatAccountMessage(accounts: ProviderAccountDetails[]): string {
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
            // Get credentials
            const credentials = getCredentialsFromEnv();

            if (credentials.length === 0) {
                return {
                    success: false,
                    message: 'No credentials configured',
                    error: 'ELECTRICITY_CREDENTIALS is empty',
                };
            }

            // Fetch account data with skipCache parameter
            const result = await this.electricityService.getUsageData(
                credentials,
                skipCache
            );

            if (result.accounts.length === 0) {
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
                return {
                    success: false,
                    message: 'Failed to send message to Telegram',
                    error: 'Telegram API request failed',
                };
            }

            return {
                success: true,
                message: 'Account balances sent to Telegram successfully',
                sentAccounts: result.accounts.length,
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
