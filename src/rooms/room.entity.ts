import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { RoomStatus } from '../common/enum/enum_status';
import { Property } from '../properties/property.entity';
import { RoomImage } from './room-image.entity';
@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn(({ type: "int" }))
  id!: number;

  @Column()
  name!: string;

  @Column({
    type: 'decimal',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  price_per_month!: number;

  @Column()
    room_number!: number;

  @Column({
    type: 'enum',
    enum: RoomStatus,
    default: RoomStatus.AVAILABLE,
  })
  status!: RoomStatus;

  @ManyToOne(() => Property, (property) => property.rooms, { nullable: false })
  @JoinColumn({ name: 'property_id' })
  property!: Property;

  @OneToMany(() => RoomImage, (img) => img.room)
  images!: RoomImage[];
}