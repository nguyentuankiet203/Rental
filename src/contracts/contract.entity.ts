import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OneToMany } from 'typeorm';
import { Invoice } from '../invoice/invoice.entity';
import { Room } from '../rooms/room.entity';
import { User } from '../users/user.entity';

export enum ContractStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
  EXPIRED = 'EXPIRED',
}

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Room, { eager: true })
  @JoinColumn({ name: 'room_id' })
  room!: Room;
  
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: User;

  @Column({ type: 'date' })
  start_date!: Date;

  @Column({ type: 'date', nullable: true })
  end_date!: Date | null;

  @Column({
    type: 'enum',
    enum: ContractStatus,
    default: ContractStatus.PENDING,
  })
  status!: ContractStatus;

  @Column('decimal')
  rent_price!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => Invoice, (invoice) => invoice.contract)
  invoices!: Invoice[];
}