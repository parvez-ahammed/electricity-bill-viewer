import { appConfig } from '@configs/config';
import {
    ElectricityProvider,
    ProviderAccountDetails,
    ProviderCredential,
} from '../interfaces/IProviderService';
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

    private getCredentials(): ProviderCredential[] {
        try {
            const credentialsJson = appConfig.electricityCredentials;

            if (!credentialsJson) {
                throw new Error('ELECTRICITY_CREDENTIALS not set');
            }

            const credentials = JSON.parse(credentialsJson);

            if (!Array.isArray(credentials)) {
                throw new Error('ELECTRICITY_CREDENTIALS must be a JSON array');
            }

            return credentials.map((cred) => ({
                username: cred.username,
                password: cred.password,
                provider: cred.provider as ElectricityProvider,
            }));
        } catch (error) {
            throw new Error(
                `Failed to parse ELECTRICITY_CREDENTIALS: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
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
            console.error('Failed to send Telegram message:', error);
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

            message += `${emoji} <b>${provider}</b> (${providerAccounts.length} account${providerAccounts.length > 1 ? 's' : ''})\n`;
            message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

            providerAccounts.forEach((account, index) => {
                message += `\n<b>${index + 1}. ${account.customerName || 'N/A'}</b>\n`;
                message += `📍 Location: ${account.location || 'N/A'}\n`;
                message += `🆔 Account: ${account.accountId || 'N/A'}\n`;
                message += `💰 <b>Balance: ৳${account.balanceRemaining || '0'}</b>\n`;
                message += `📊 Type: ${account.accountType || 'N/A'}\n`;
                message += `🔌 Status: ${account.connectionStatus || 'N/A'}\n`;
                message += `📅 Updated: ${account.balanceLatestDate || 'N/A'}\n`;

                if (account.lastPaymentAmount && account.lastPaymentDate) {
                    message += `💳 Last Payment: ৳${account.lastPaymentAmount} on ${account.lastPaymentDate}\n`;
                }

                if (index < providerAccounts.length - 1) {
                    message += `\n`;
                }
            });

            message += `\n`;
        }

        // Summary
        const totalBalance = accounts.reduce((sum, account) => {
            const balance = parseFloat(
                account.balanceRemaining.replace(/[^0-9.-]/g, '')
            );
            return sum + (isNaN(balance) ? 0 : balance);
        }, 0);

        message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        message += `📊 <b>Summary</b>\n`;
        message += `Total Accounts: ${accounts.length}\n`;
        message += `💵 Total Balance: <b>৳${totalBalance.toFixed(2)}</b>\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

        return message;
    }

    async sendAccountBalances(): Promise<{
        success: boolean;
        message: string;
        sentAccounts?: number;
        error?: string;
    }> {
        try {
            // Get credentials
            const credentials = this.getCredentials();

            if (credentials.length === 0) {
                return {
                    success: false,
                    message: 'No credentials configured',
                    error: 'ELECTRICITY_CREDENTIALS is empty',
                };
            }

            // Fetch account data
            const result =
                await this.electricityService.getUsageData(credentials);

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
