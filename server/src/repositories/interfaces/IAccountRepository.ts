import { CreateAccountRequest, UpdateAccountRequest } from '@interfaces/Account';
import { ElectricityProvider } from '@interfaces/Shared';
import { Account } from '../../entities/Account';

export interface IAccountRepository {
    create(data: CreateAccountRequest, userId: string): Promise<Account>;
    findByIdAndUserId(id: string, userId: string): Promise<Account | null>;
    findAllByUserId(userId: string): Promise<Account[]>;
    update(id: string, userId: string, data: UpdateAccountRequest): Promise<Account | null>;
    delete(id: string, userId: string): Promise<boolean>;
    findByProviderAndUserId(provider: ElectricityProvider, userId: string): Promise<Account[]>;
    forceDelete(id: string, userId: string): Promise<boolean>;
    findAllSystem(): Promise<Account[]>;
}