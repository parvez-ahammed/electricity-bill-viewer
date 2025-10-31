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

    async create(data: CreateAccountRequest): Promise<Account> {
        // Encrypt sensitive credentials before saving
        const encryptedCredentials = EncryptionService.encryptCredentials(data.credentials);
        
        const account = this.repository.create({
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

    async findById(id: string): Promise<Account | null> {
        const account = await this.repository.findOne({
            where: { id },
        });
        
        if (!account) {
            return null;
        }
        
        // Decrypt credentials before returning
        return {
            ...account,
            credentials: EncryptionService.decryptCredentials(account.credentials),
        };
    }

    async findAll(): Promise<Account[]> {
        const accounts = await this.repository.find({
            order: { createdAt: 'DESC' },
        });
        
        // Decrypt credentials for all accounts before returning
        return accounts.map(account => ({
            ...account,
            credentials: EncryptionService.decryptCredentials(account.credentials),
        }));
    }

    async update(id: string, data: UpdateAccountRequest): Promise<Account | null> {
        const account = await this.repository.findOne({ where: { id } });
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

    async delete(id: string): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected !== undefined && result.affected > 0;
    }

    async findByProvider(provider: ElectricityProvider): Promise<Account[]> {
        const accounts = await this.repository.find({
            where: { provider },
            order: { createdAt: 'DESC' },
        });
        
        // Decrypt credentials for all accounts before returning
        return accounts.map(account => ({
            ...account,
            credentials: EncryptionService.decryptCredentials(account.credentials),
        }));
    }
}