import ApiError from '@helpers/ApiError';
import { Knex } from 'knex';
import httpStatus from 'http-status';

export class PaginationQueryBuilder<T> {
    private query: Knex.QueryBuilder;
    private tableName: string;
    private db: Knex;

    constructor(db: Knex, tableName: string) {
        this.db = db;
        this.tableName = tableName;
        this.query = this.db(this.tableName);
    }

    selectFields(fields?: string): this {
        if (fields) {
            const selectedFields = fields.split(',').map((f) => f.trim());
            this.query = this.query.select(selectedFields);
        } else {
            this.query = this.query.select('*');
        }
        return this;
    }

    applyFilters(filter?: string, filterOperator?: string): this {
        if (!filter) return this;

        const filterConditions = filter.split(',').map((condition) => {
            const [field, operator, value] = condition.split(':');

            if (!field || !operator || !value) {
                throw new ApiError(
                    httpStatus.BAD_REQUEST,
                    `Invalid filter format: ${condition}`
                );
            }

            const knexOperators: Record<string, string> = {
                eq: '=',
                ilike: 'ILIKE',
                gt: '>',
                lt: '<',
                gte: '>=',
                lte: '<=',
                in: 'IN',
                notin: 'NOT IN',
            };

            if (!knexOperators[operator]) {
                throw new ApiError(
                    httpStatus.BAD_REQUEST,
                    `Unsupported operator: ${operator}`
                );
            }

            return {
                field,
                operator: knexOperators[operator],
                value,
            };
        });

        this.query = this.query.where(function () {
            filterConditions.forEach(({ field, operator, value }, index) => {
                if (operator === 'IN') {
                    const values = [];
                    values.push(value);
                    this.whereRaw(`${field} @> (?)`, [values]);
                } else {
                    const formattedValue =
                        operator === 'ILIKE' ? `%${value}%` : value;
                    if (index === 0) {
                        this.where(field, operator, formattedValue);
                    } else {
                        if (filterOperator === 'AND') {
                            this.andWhere(field, operator, formattedValue);
                        } else {
                            this.orWhere(field, operator, formattedValue);
                        }
                    }
                }
            });
        });

        return this;
    }

    applyPagination(page?: number, perPage?: number): this {
        if (page && perPage) {
            const offset = (page - 1) * perPage;
            this.query = this.query.limit(perPage).offset(offset);
        }
        return this;
    }

    applyOrder(order?: string): this {
        if (order) {
            const [orderBy, orderDirection] = order.split(':');
            this.query = this.query.orderBy(
                orderBy,
                orderDirection.toLowerCase() === 'desc' ? 'desc' : 'asc'
            );
        }
        return this;
    }

    async execute(): Promise<T[]> {
        return await this.query;
    }
}
