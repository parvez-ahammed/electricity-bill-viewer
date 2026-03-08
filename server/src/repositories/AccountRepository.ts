import { AppDataSource } from '@configs/database';
import logger from '@helpers/Logger';
import { CorruptedCredentials, CreateAccountRequest, UpdateAccountRequest } from '@interfaces/Account';
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

    async create(data: CreateAccountRequest, userId: string): Promise<Account> {
        // Encrypt sensitive credentials before saving
        const encryptedCredentials = EncryptionService.encryptCredentials(data.credentials);

        const account = this.repository.create({
            userId,
            provider: data.provider,
            credentials: encryptedCredentials,
        });

        const savedAccount = await this.repository.save(account);

        // Return account with decrypted credentials for immediate use
        return {
            ...savedAccount,
            credentials: data.credentials, // Return original unencrypted credentials
        };
    }

    async findByIdAndUserId(id: string, userId: string): Promise<Account | null> {
        const account = await this.repository.findOne({
            where: { id, userId },
        });

        if (!account) {
            return null;
        }

        try {
            // Decrypt credentials before returning
            return {
                ...account,
                credentials: EncryptionService.decryptCredentials(account.credentials),
            };
        } catch (error) {
            logger.error(`Failed to decrypt account ${id}: ${error instanceof Error ? error.message : String(error)}`);
            const corrupted: CorruptedCredentials = {
                username: '[CORRUPTED DATA]',
                _isCorrupted: true,
                _originalId: account.id,
            };
            return { ...account, credentials: corrupted };
        }
    }

    async findAllByUserId(userId: string): Promise<Account[]> {
        const accounts = await this.repository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });

        const validAccounts: Account[] = [];
        const corruptedAccountIds: string[] = [];

        for (const account of accounts) {
            try {
                validAccounts.push({
                    ...account,
                    credentials: EncryptionService.decryptCredentials(account.credentials),
                });
            } catch (error) {
                logger.error(`Failed to decrypt account ${account.id}: ${error instanceof Error ? error.message : String(error)}`);
                corruptedAccountIds.push(account.id);
                const corrupted: CorruptedCredentials = {
                    username: '[CORRUPTED DATA]',
                    _isCorrupted: true,
                    _originalId: account.id,
                };
                validAccounts.push({ ...account, credentials: corrupted });
            }
        }

        if (corruptedAccountIds.length > 0) {
            logger.warn(`Found ${corruptedAccountIds.length} corrupted account(s): ${corruptedAccountIds.join(', ')}`);
        }

        return validAccounts;
    }

    async update(id: string, userId: string, data: UpdateAccountRequest): Promise<Account | null> {
        const account = await this.repository.findOne({ where: { id, userId } });
        if (!account) {
            return null;
        }

        // Encrypt new credentials before saving
        const encryptedCredentials = EncryptionService.encryptCredentials(data.credentials);
        account.credentials = encryptedCredentials;

        const updatedAccount = await this.repository.save(account);

        // Return account with decrypted credentials
        return {
            ...updatedAccount,
            credentials: data.credentials, // Return original unencrypted credentials
        };
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

        const validAccounts: Account[] = [];

        for (const account of accounts) {
            try {
                validAccounts.push({
                    ...account,
                    credentials: EncryptionService.decryptCredentials(account.credentials),
                });
            } catch (error) {
                logger.error(`Failed to decrypt account ${account.id}: ${error instanceof Error ? error.message : String(error)}`);
                const corrupted: CorruptedCredentials = {
                    username: '[CORRUPTED DATA]',
                    _isCorrupted: true,
                    _originalId: account.id,
                };
                validAccounts.push({ ...account, credentials: corrupted });
            }
        }

        return validAccounts;
    }

    async findAllSystem(): Promise<Account[]> {
        const accounts = await this.repository.find({
            order: { createdAt: 'DESC' },
        });

        const validAccounts: Account[] = [];

        for (const account of accounts) {
            try {
                validAccounts.push({
                    ...account,
                    credentials: EncryptionService.decryptCredentials(account.credentials),
                });
            } catch (error) {
                logger.error(`Failed to decrypt account ${account.id}: ${error instanceof Error ? error.message : String(error)}`);
                const corrupted: CorruptedCredentials = {
                    username: '[CORRUPTED DATA]',
                    _isCorrupted: true,
                    _originalId: account.id,
                };
                validAccounts.push({ ...account, credentials: corrupted });
            }
        }

        return validAccounts;
    }
}
