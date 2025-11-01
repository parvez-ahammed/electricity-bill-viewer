import { AccountRecord, CreateAccountRequest, UpdateAccountRequest } from '@interfaces/Account';

export interface IAccountService {
    createAccount(data: CreateAccountRequest): Promise<AccountRecord>;
    getAccountById(id: string): Promise<AccountRecord | null>;
    getAllAccounts(): Promise<AccountRecord[]>;
    updateAccount(id: string, data: UpdateAccountRequest): Promise<AccountRecord | null>;
    deleteAccount(id: string): Promise<boolean>;
    forceDeleteAccount(id: string): Promise<boolean>;
    getAccountsByProvider(provider: string): Promise<AccountRecord[]>;
}