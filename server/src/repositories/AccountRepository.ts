import { AppDataSource } from '@configs/database';
import { CreateAccountRequest, UpdateAccountRequest } from '@interfaces/Account';
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
            console.error(`Failed to decrypt account ${id}:`, error);
            // Return corrupted account marker
            return {
                ...account,
                credentials: { 
                    username: '[CORRUPTED DATA]',
                    _isCorrupted: true,
                    _originalId: account.id 
                } as any,
            };
        }
    }

    async findAllByUserId(userId: string): Promise<Account[]> {
        const accounts = await this.repository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
        
        // Decrypt credentials for all accounts before returning
        // Handle decryption failures gracefully
        const validAccounts: Account[] = [];
        const corruptedAccountIds: string[] = [];
        
        for (const account of accounts) {
            try {
                const decryptedAccount = {
                    ...account,
                    credentials: EncryptionService.decryptCredentials(account.credentials),
                };
                validAccounts.push(decryptedAccount);
            } catch (error) {
                console.error(`Failed to decrypt account ${account.id}:`, error);
                corruptedAccountIds.push(account.id);
                
                // Add a corrupted account marker for UI handling
                validAccounts.push({
                    ...account,
                    credentials: { 
                        username: '[CORRUPTED DATA]',
                        _isCorrupted: true,
                        _originalId: account.id 
                    } as any,
                });
            }
        }
        
        if (corruptedAccountIds.length > 0) {
            console.warn(`Found ${corruptedAccountIds.length} corrupted account(s):`, corruptedAccountIds);
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
     * Force delete an account without attempting to decrypt credentials
     * Useful for removing corrupted accounts
     */
    async forceDelete(id: string, userId: string): Promise<boolean> {
        try {
            const result = await this.repository.delete({ id, userId });
            return result.affected !== undefined && result.affected > 0;
        } catch (error) {
            console.error(`Failed to force delete account ${id}:`, error);
            return false;
        }
    }

    async findByProviderAndUserId(provider: ElectricityProvider, userId: string): Promise<Account[]> {
        const accounts = await this.repository.find({
            where: { provider, userId },
            order: { createdAt: 'DESC' },
        });
        
        // Decrypt credentials for all accounts before returning
        // Handle decryption failures gracefully
        const validAccounts: Account[] = [];
        
        for (const account of accounts) {
            try {
                const decryptedAccount = {
                    ...account,
                    credentials: EncryptionService.decryptCredentials(account.credentials),
                };
                validAccounts.push(decryptedAccount);
            } catch (error) {
                console.error(`Failed to decrypt account ${account.id}:`, error);
                
                // Add a corrupted account marker for UI handling
                validAccounts.push({
                    ...account,
                    credentials: { 
                        username: '[CORRUPTED DATA]',
                        _isCorrupted: true,
                        _originalId: account.id 
                    } as any,
                });
            }
        }
        
        return validAccounts;
    }

    async findAllSystem(): Promise<Account[]> {
        const accounts = await this.repository.find({
            order: { createdAt: 'DESC' },
        });
        
        // Decrypt credentials for all accounts before returning
        const validAccounts: Account[] = [];
        
        for (const account of accounts) {
            try {
                const decryptedAccount = {
                    ...account,
                    credentials: EncryptionService.decryptCredentials(account.credentials),
                };
                validAccounts.push(decryptedAccount);
            } catch (error) {
                console.error(`Failed to decrypt account ${account.id}:`, error);
                // Return corrupted account marker
                validAccounts.push({
                    ...account,
                    credentials: { 
                        username: '[CORRUPTED DATA]',
                        _isCorrupted: true,
                        _originalId: account.id 
                    } as any,
                });
            }
        }
        
        return validAccounts;
    }
}