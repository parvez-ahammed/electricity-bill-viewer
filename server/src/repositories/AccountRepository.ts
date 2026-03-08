import { AppDataSource } from '@configs/database';
import logger from '@helpers/Logger';
import { CorruptedCredentials, CreateAccountRequest, ProviderCredentials, UpdateAccountRequest } from '@interfaces/Account';
import { ElectricityProvider } from '@interfaces/Shared';
import { EncryptionService } from '@utility/encryption';
import { Repository } from 'typeorm';
import { Account } from '../entities/Account';
import { IAccountRepository } from './interfaces/IAccountRepository';

export class AccountRepository implements IAccountRepository {
    private repository: Repository<Account>;

    constructor() {
        this.repository = AppDataSource.getRepository(Account);
    }

    private decryptOrMarkCorrupted(account: Account): Account {
        try {
            return {
                ...account,
                credentials: EncryptionService.decryptCredentials(account.credentials),
            };
        } catch (error) {
            logger.error(`Failed to decrypt account ${account.id}: ${error instanceof Error ? error.message : String(error)}`);
            const corrupted: CorruptedCredentials = {
                username: '[CORRUPTED DATA]',
                _isCorrupted: true,
                _originalId: account.id,
            };
            return { ...account, credentials: corrupted };
        }
    }

    private decryptAccountList(accounts: Account[], logCorrupted = false): Account[] {
        const result: Account[] = [];
        const corruptedIds: string[] = [];

        for (const account of accounts) {
            const decrypted = this.decryptOrMarkCorrupted(account);
            result.push(decrypted);

            if ('_isCorrupted' in decrypted.credentials) {
                corruptedIds.push(account.id);
            }
        }

        if (logCorrupted && corruptedIds.length > 0) {
            logger.warn(`Found ${corruptedIds.length} corrupted account(s): ${corruptedIds.join(', ')}`);
        }

        return result;
    }

    private returnWithOriginalCredentials(account: Account, originalCredentials: ProviderCredentials): Account {
        return { ...account, credentials: originalCredentials };
    }

    async create(data: CreateAccountRequest, userId: string): Promise<Account> {
        const encryptedCredentials = EncryptionService.encryptCredentials(data.credentials);

        const account = this.repository.create({
            userId,
            provider: data.provider,
            credentials: encryptedCredentials,
        });

        const savedAccount = await this.repository.save(account);
        return this.returnWithOriginalCredentials(savedAccount, data.credentials);
    }

    async findByIdAndUserId(id: string, userId: string): Promise<Account | null> {
        const account = await this.repository.findOne({ where: { id, userId } });
        if (!account) return null;
        return this.decryptOrMarkCorrupted(account);
    }

    async findAllByUserId(userId: string): Promise<Account[]> {
        const accounts = await this.repository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
        return this.decryptAccountList(accounts, true);
    }

    async update(id: string, userId: string, data: UpdateAccountRequest): Promise<Account | null> {
        const account = await this.repository.findOne({ where: { id, userId } });
        if (!account) return null;

        const encryptedCredentials = EncryptionService.encryptCredentials(data.credentials);
        account.credentials = encryptedCredentials;

        const updatedAccount = await this.repository.save(account);
        return this.returnWithOriginalCredentials(updatedAccount, data.credentials);
    }

    async delete(id: string, userId: string): Promise<boolean> {
        const result = await this.repository.delete({ id, userId });
        return result.affected !== undefined && result.affected > 0;
    }

    /**
     * Force delete an account without attempting to decrypt credentials.
     * Used for removing corrupted accounts where normal decryption is not possible.
     */
    async forceDelete(id: string, userId: string): Promise<boolean> {
        try {
            const result = await this.repository.delete({ id, userId });
            return result.affected !== undefined && result.affected > 0;
        } catch (error) {
            logger.error(`Failed to force delete account ${id}: ${error instanceof Error ? error.message : String(error)}`);
            return false;
        }
    }

    async findByProviderAndUserId(provider: ElectricityProvider, userId: string): Promise<Account[]> {
        const accounts = await this.repository.find({
            where: { provider, userId },
            order: { createdAt: 'DESC' },
        });
        return this.decryptAccountList(accounts);
    }

    async findAllSystem(): Promise<Account[]> {
        const accounts = await this.repository.find({
            order: { createdAt: 'DESC' },
        });
        return this.decryptAccountList(accounts);
    }
}
