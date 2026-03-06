import ApiError from '@helpers/ApiError';
import { AccountRecord, CreateAccountRequest, UpdateAccountRequest } from '@interfaces/Account';
import { ElectricityProvider } from '@interfaces/Shared';
import { AccountRepository } from '../../repositories/AccountRepository';
import { IAccountRepository } from '../../repositories/interfaces/IAccountRepository';
import { IAccountService } from '../interfaces/IAccountService';
import { cacheService } from './RedisCacheService';

export class AccountService implements IAccountService {
    private accountRepository: IAccountRepository;

    constructor() {
        this.accountRepository = new AccountRepository();
    }

    async createAccount(data: CreateAccountRequest, userId: string): Promise<AccountRecord> {
        const account = await this.accountRepository.create(data, userId);
        return this.mapToAccountRecord(account);
    }

    async getAccountById(id: string, userId: string): Promise<AccountRecord | null> {
        const account = await this.accountRepository.findByIdAndUserId(id, userId);
        return account ? this.mapToAccountRecord(account) : null;
    }

    async getAllAccounts(userId: string): Promise<AccountRecord[]> {
        const accounts = await this.accountRepository.findAllByUserId(userId);
        return accounts.map(account => this.mapToAccountRecord(account));
    }

    async updateAccount(id: string, userId: string, data: UpdateAccountRequest): Promise<AccountRecord | null> {
        const account = await this.accountRepository.update(id, userId, data);
        return account ? this.mapToAccountRecord(account) : null;
    }

    async deleteAccount(id: string, userId: string): Promise<boolean> {
        return await this.accountRepository.delete(id, userId);
    }

    async forceDeleteAccount(id: string, userId: string): Promise<boolean> {
        return await this.accountRepository.forceDelete(id, userId);
    }

    async getAccountsByProvider(provider: string, userId: string): Promise<AccountRecord[]> {
        const accounts = await this.accountRepository.findByProviderAndUserId(provider as ElectricityProvider, userId);
        return accounts.map(account => this.mapToAccountRecord(account));
    }

    async getAllAccountsSystem(): Promise<AccountRecord[]> {
        const accounts = await this.accountRepository.findAllSystem();
        return accounts.map(account => this.mapToAccountRecord(account));
    }

    async setAccountNickname(accountId: string, userId: string, nickname: string): Promise<boolean> {
        const account = await this.getAccountById(accountId, userId);
        if (!account) {
            throw new ApiError(404, 'Account not found');
        }
        const success = await cacheService.setAccountNickname(accountId, nickname);
        if (!success) {
            throw new ApiError(500, 'Failed to set nickname');
        }
        return true;
    }

    async getAccountNickname(accountId: string, userId: string): Promise<string | null> {
        const account = await this.getAccountById(accountId, userId);
        if (!account) {
            throw new ApiError(404, 'Account not found');
        }
        return await cacheService.getAccountNickname(accountId);
    }

    async deleteAccountNickname(accountId: string, userId: string): Promise<boolean> {
        const account = await this.getAccountById(accountId, userId);
        if (!account) {
            throw new ApiError(404, 'Account not found');
        }
        const success = await cacheService.deleteAccountNickname(accountId);
        if (!success) {
            throw new ApiError(500, 'Failed to delete nickname');
        }
        return true;
    }

    private mapToAccountRecord(account: any): AccountRecord {
        return {
            id: account.id,
            userId: account.userId,
            provider: account.provider,
            credentials: account.credentials,
            createdAt: account.createdAt,
            updatedAt: account.updatedAt,
        };
    }
}