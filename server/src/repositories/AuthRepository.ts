import { db } from '../database/data-source';
import { Auth } from '../database/entity/Auth';
import { BaseRepository } from './BaseRepository';

export class AuthRepository extends BaseRepository<Auth> {
    constructor() {
        super(Auth, db);
    }
}
