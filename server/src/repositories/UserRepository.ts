import { db } from '../database/data-source';
import { User } from '../database/entity/User';
import { BaseRepository } from './BaseRepository';

export class UserRepository extends BaseRepository<User> {
    constructor() {
        super(User, db);
    }
}
