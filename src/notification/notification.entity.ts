import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn, Index,
} from 'typeorm';

export enum NotificationType {
  INVOICE = 'INVOICE',
  SYSTEM = 'SYSTEM',
}
@Index(['userId'])
@Index(['isRead'])
@Index(['createdAt'])

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id' })
  userId!: number;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  message?: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.SYSTEM,
  })
  type!: NotificationType;

  @Column({ name: 'ref_id', nullable: true })
  refId?: number;

  @Column({ name: 'is_read', default: false })
  isRead!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}