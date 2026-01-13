import { AuthDataSource } from '@configs/database';
import { CreateUserDto } from '@interfaces/Auth';
import { Repository } from 'typeorm';
import { User } from '../entities/User';
import { IUserRepository } from './interfaces/IUserRepository';

export class UserRepository implements IUserRepository {
    private repository: Repository<User>;

    constructor() {
        this.repository = AuthDataSource.getRepository(User);
    }

    async findByGoogleId(googleId: string): Promise<User | null> {
        return await this.repository.findOne({
            where: { id: googleId },
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.repository.findOne({
            where: { email },
        });
    }

    async findById(id: string): Promise<User | null> {
        return await this.repository.findOne({
            where: { id },
        });
    }

    async create(data: CreateUserDto): Promise<User> {
        const user = this.repository.create(data);
        return await this.repository.save(user);
    }
}
