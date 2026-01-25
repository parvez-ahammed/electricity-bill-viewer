import { ElectricityProvider } from './Shared';

export interface DPDCCredentials {
    username: string;
    password: string;
    clientSecret: string;
}

export interface NESCOCredentials {
    username: string;
}

export type ProviderCredentials = DPDCCredentials | NESCOCredentials;

export interface AccountRecord {
    id: string;
    userId: string;
    provider: ElectricityProvider;
    credentials: ProviderCredentials;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateAccountRequest {
    provider: ElectricityProvider;
    credentials: ProviderCredentials;
}

export interface UpdateAccountRequest {
    credentials: ProviderCredentials;
}

export interface AccountResponse {
    id: string;
    userId: string;
    provider: ElectricityProvider;
    credentials: ProviderCredentials;
    createdAt: string;
    updatedAt: string;
}