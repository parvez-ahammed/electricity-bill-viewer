import {
    DataSource,
    DeepPartial,
    FindOptionsWhere,
    ObjectLiteral,
    Repository,
} from 'typeorm';

export class BaseRepository<T extends ObjectLiteral> {
    protected repository: Repository<T>;

    constructor(entity: { new (): T }, dataSource: DataSource) {
        this.repository = dataSource.getRepository(entity);
    }

    async create(data: DeepPartial<T>): Promise<T | null> {
        const entity = this.repository.create(data);
        return await this.repository.save(entity);
    }

    async exists(condition: FindOptionsWhere<T>): Promise<boolean> {
        const result = await this.repository.findOneBy(condition);
        return !!result;
    }

    async findOne(condition: FindOptionsWhere<T>): Promise<T | null> {
        return await this.repository.findOneBy(condition);
    }

    async findAll(): Promise<T[]> {
        return await this.repository.find();
    }

    async findByWhere(where: FindOptionsWhere<T>): Promise<T[]> {
        return await this.repository.findBy(where);
    }

    async update(
        condition: FindOptionsWhere<T>,
        updateData: DeepPartial<T>
    ): Promise<T | null> {
        const entity = await this.repository.findOneBy(condition);
        if (!entity) return null;
        Object.assign(entity, updateData);
        return await this.repository.save(entity);
    }

    async delete(condition: FindOptionsWhere<T>): Promise<T | null> {
        const entity = await this.repository.findOneBy(condition);
        if (!entity) return null;
        await this.repository.remove(entity);
        return entity;
    }

    async count(condition: FindOptionsWhere<T> = {}): Promise<number> {
        return await this.repository.count({ where: condition });
    }
}
