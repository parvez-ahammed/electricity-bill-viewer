import { CreateAccountRequest, UpdateAccountRequest } from '@interfaces/Account';
import { ElectricityProvider } from '@interfaces/Shared';
import { Account } from '../../entities/Account';

export interface IAccountRepository {
    create(data: CreateAccountRequest): Promise<Account>;
    findById(id: string): Promise<Account | null>;
    findAll(): Promise<Account[]>;
    update(id: string, data: UpdateAccountRequest): Promise<Account | null>;
    delete(id: string): Promise<boolean>;
    findByProvider(provider: ElectricityProvider): Promise<Account[]>;
}