import { ProviderCredentials } from '@interfaces/Account';
import { ElectricityProvider } from '@interfaces/Shared';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('accounts')
export class Account {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'varchar',
        enum: ElectricityProvider,
    })
    provider: ElectricityProvider;

    @Column('json')
    credentials: ProviderCredentials;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}