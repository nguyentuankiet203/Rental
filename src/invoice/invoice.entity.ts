import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Unique, OneToMany
} from 'typeorm';
import { Contract } from '../contracts/contract.entity';
import { Payment } from '../payments/payment.entity'

export enum InvoiceStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

@Entity('invoices')
@Unique(['contract_id', 'month'])
export class Invoice {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  contract_id!: number;

  @ManyToOne(() => Contract, (c) => c.invoices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contract_id' })
  contract!: Contract;

  @Column({ length: 7 })
  month!: string;

  @Column({ type: 'date' })
  due_date!: Date;

  @Column({ type: 'numeric', default: 0 })
  base_rent!: number;

  @Column({ type: 'numeric', default: 0 })
  utility_fee!: number;

  @Column({ type: 'numeric' })
  total_amount!: number;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.UNPAID,
  })
  status!: 'UNPAID' | 'PAID' | 'OVERDUE';

  @Column({ type: 'timestamp', nullable: true })
  paid_at!: Date | null;

  @CreateDateColumn()
  created_at!: Date;

  @OneToMany(() => Payment, (p) => p.invoice)
  payments!: Payment[];
}