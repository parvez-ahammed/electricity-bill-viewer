import { AuthResponseDto } from '@dtos/AuthResponse.dto';
import { Knex } from 'knex';

export default interface IAuthService {
    saveUserCredentials(userId: string, password: string): Promise<void>;
    loginWithEmailPassword(email: string, password: string);
    deleteUserCredentials(
        userId: string,
        trx?: Knex.Transaction
    ): Promise<AuthResponseDto>;
    updatePassword(
        userId: string,
        newPassword: string,
        currentPassword: string,
        trx?: Knex.Transaction
    ): Promise<AuthResponseDto>;
}
