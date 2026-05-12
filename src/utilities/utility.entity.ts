import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  Unique,
  JoinColumn,
} from 'typeorm';

import { Room } from '../rooms/room.entity';

@Entity('utility_reading')
@Unique(['room', 'month', 'year'])
export class Utility {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Room, { eager: true })
  @JoinColumn({ name: 'room_id' })
  room!: Room;

  @Column()
  month!: number;

  @Column()
  year!: number;

  @Column()
  electric_old!: number;

  @Column()
  electric_new!: number;

  @Column()
  water_old!: number;

  @Column()
  water_new!: number;

  @Column()
  electric_price!: number;

  @Column()
  water_price!: number;
}