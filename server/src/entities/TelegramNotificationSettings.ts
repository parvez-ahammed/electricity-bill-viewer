import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Account } from './Account';

@Entity('telegram_notification_settings')
export class TelegramNotificationSettings {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    accountId: string;

    @OneToOne(() => Account, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'accountId' })
    account: Account;

    @Column({ type: 'varchar', nullable: true })
    chatId: string | null;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
