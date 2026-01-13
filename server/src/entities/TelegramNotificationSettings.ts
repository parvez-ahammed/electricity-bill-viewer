import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('telegram_notification_settings')
export class TelegramNotificationSettings {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Singleton identifier column, though we will just query for the first record usually.
    // Or we can just ensure only one row exists via logic.
    @Column({ type: 'varchar', nullable: true })
    chatId: string | null;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
