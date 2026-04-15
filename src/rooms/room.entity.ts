import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { RoomStatus } from '../common/enum/enum_status';
import { Property } from '../properties/property.entity';
import { User } from '../users/user.entity';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column('decimal')
  price!: number;

  @Column({
    type: 'enum',
    enum: RoomStatus,
    default: RoomStatus.AVAILABLE,
  })
  status: RoomStatus;

  @ManyToOne(() => Property, (property) => property.rooms, { nullable: false })
  @JoinColumn({ name: 'property_id' })
  property!: Property;

  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: User;
}