import { AccountRecord, CreateAccountRequest, UpdateAccountRequest } from '@interfaces/Account';

export interface IAccountService {
    createAccount(data: CreateAccountRequest, userId: string): Promise<AccountRecord>;
    getAccountById(id: string, userId: string): Promise<AccountRecord>;
    getAllAccounts(userId: string): Promise<AccountRecord[]>;
    updateAccount(id: string, userId: string, data: UpdateAccountRequest): Promise<AccountRecord>;
    deleteAccount(id: string, userId: string): Promise<boolean>;
    forceDeleteAccount(id: string, userId: string): Promise<boolean>;
    getAccountsByProvider(provider: string, userId: string): Promise<AccountRecord[]>;
    getAllAccountsSystem(): Promise<AccountRecord[]>;
    setAccountNickname(accountId: string, userId: string, nickname: string): Promise<boolean>;
    getAccountNickname(accountId: string, userId: string): Promise<string | null>;
    deleteAccountNickname(accountId: string, userId: string): Promise<boolean>;
}