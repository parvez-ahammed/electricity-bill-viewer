import { ProviderAccountDetails } from '@interfaces/Shared';

export interface ITelegramService {
    sendAccountBalances(skipCache?: boolean): Promise<{
        success: boolean;
        message: string;
        sentAccounts?: number;
        error?: string;
    }>;

    formatAccountMessage(accounts: ProviderAccountDetails[]): string;

    sendMessage(message: string): Promise<boolean>;
}
