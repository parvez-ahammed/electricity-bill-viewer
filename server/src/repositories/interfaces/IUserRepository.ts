import { CreateUserDto } from '@interfaces/Auth';
import { User } from '../../entities/User';

export interface IUserRepository {
    findByGoogleId(googleId: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    create(data: CreateUserDto): Promise<User>;
}
