import { AccountRecord, CreateAccountRequest, UpdateAccountRequest } from '@interfaces/Account';
import { ElectricityProvider } from '@interfaces/Shared';
import { AccountRepository } from '../../repositories/AccountRepository';
import { IAccountRepository } from '../../repositories/interfaces/IAccountRepository';
import { IAccountService } from '../interfaces/IAccountService';

export class AccountService implements IAccountService {
    private accountRepository: IAccountRepository;

    constructor() {
        this.accountRepository = new AccountRepository();
    }

    async createAccount(data: CreateAccountRequest): Promise<AccountRecord> {
        const account = await this.accountRepository.create(data);
        return this.mapToAccountRecord(account);
    }

    async getAccountById(id: string): Promise<AccountRecord | null> {
        const account = await this.accountRepository.findById(id);
        return account ? this.mapToAccountRecord(account) : null;
    }

    async getAllAccounts(): Promise<AccountRecord[]> {
        const accounts = await this.accountRepository.findAll();
        return accounts.map(account => this.mapToAccountRecord(account));
    }

    async updateAccount(id: string, data: UpdateAccountRequest): Promise<AccountRecord | null> {
        const account = await this.accountRepository.update(id, data);
        return account ? this.mapToAccountRecord(account) : null;
    }

    async deleteAccount(id: string): Promise<boolean> {
        return await this.accountRepository.delete(id);
    }

    async getAccountsByProvider(provider: string): Promise<AccountRecord[]> {
        const accounts = await this.accountRepository.findByProvider(provider as ElectricityProvider);
        return accounts.map(account => this.mapToAccountRecord(account));
    }

    private mapToAccountRecord(account: any): AccountRecord {
        return {
            id: account.id,
            provider: account.provider,
            credentials: account.credentials,
            createdAt: account.createdAt,
            updatedAt: account.updatedAt,
        };
    }
}