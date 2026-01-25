import { AccountRecord, CreateAccountRequest, UpdateAccountRequest } from '@interfaces/Account';

export interface IAccountService {
    createAccount(data: CreateAccountRequest, userId: string): Promise<AccountRecord>;
    getAccountById(id: string, userId: string): Promise<AccountRecord | null>;
    getAllAccounts(userId: string): Promise<AccountRecord[]>;
    updateAccount(id: string, userId: string, data: UpdateAccountRequest): Promise<AccountRecord | null>;
    deleteAccount(id: string, userId: string): Promise<boolean>;
    forceDeleteAccount(id: string, userId: string): Promise<boolean>;
    getAccountsByProvider(provider: string, userId: string): Promise<AccountRecord[]>;
    getAllAccountsSystem(): Promise<AccountRecord[]>;
}