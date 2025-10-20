import { ProviderAccountDetails } from './IProviderService';

export interface ITelegramService {
    sendAccountBalances(): Promise<{
        success: boolean;
        message: string;
        sentAccounts?: number;
        error?: string;
    }>;

    formatAccountMessage(accounts: ProviderAccountDetails[]): string;

    sendMessage(message: string): Promise<boolean>;
}
