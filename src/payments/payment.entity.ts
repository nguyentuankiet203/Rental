import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Invoice } from '../invoice/invoice.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Invoice, (i) => i.payments)
  @JoinColumn({ name: 'invoice_id' })
  invoice!: Invoice;

  @Column()
  method!: string;

  @Column()
  amount!: number;

  @Column({ nullable: true })
  transaction_code!: string;

  @Column({ default: 'PENDING' })
  status!: string;

  @CreateDateColumn()
  created_at!: Date;
}