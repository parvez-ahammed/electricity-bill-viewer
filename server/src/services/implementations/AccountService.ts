import ApiError from '@helpers/ApiError';
import { AccountRecord, CreateAccountRequest, UpdateAccountRequest } from '@interfaces/Account';
import { ElectricityProvider } from '@interfaces/Shared';
import { Account } from '../../entities/Account';
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

    async getAccountById(id: string, userId: string): Promise<AccountRecord> {
        const account = await this.accountRepository.findByIdAndUserId(id, userId);
        if (!account) {
            throw new ApiError(404, 'Account not found');
        }
        return this.mapToAccountRecord(account);
    }

    async getAllAccounts(userId: string): Promise<AccountRecord[]> {
        const accounts = await this.accountRepository.findAllByUserId(userId);
        return accounts.map(account => this.mapToAccountRecord(account));
    }

    async updateAccount(id: string, userId: string, data: UpdateAccountRequest): Promise<AccountRecord> {
        // Verify the account exists and validate credential shape matches provider
        const existing = await this.accountRepository.findByIdAndUserId(id, userId);
        if (!existing) {
            throw new ApiError(404, 'Account not found');
        }

        // Prevent credential shape mismatch (e.g. NESCO credentials on a DPDC account)
        if (existing.provider === ElectricityProvider.DPDC) {
            if (!('password' in data.credentials) || !('clientSecret' in data.credentials)) {
                throw new ApiError(400, 'DPDC accounts require password and clientSecret');
            }
        }

        const account = await this.accountRepository.update(id, userId, data);
        if (!account) {
            throw new ApiError(404, 'Account not found');
        }
        return this.mapToAccountRecord(account);
    }

    async deleteAccount(id: string, userId: string): Promise<boolean> {
        const deleted = await this.accountRepository.delete(id, userId);
        if (!deleted) {
            throw new ApiError(404, 'Account not found');
        }
        return true;
    }

    async forceDeleteAccount(id: string, userId: string): Promise<boolean> {
        const deleted = await this.accountRepository.forceDelete(id, userId);
        if (!deleted) {
            throw new ApiError(404, 'Account not found');
        }
        return true;
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

    private mapToAccountRecord(account: Account): AccountRecord {
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