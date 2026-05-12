import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';  // Added JoinColumn
import { User } from '../users/user.entity';
import { OneToMany } from 'typeorm';
import { Room } from '../rooms/room.entity';

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  address!: string;

  @OneToMany(() => Room, (room) => room.property)
  rooms!: Room[];

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  @JoinColumn({ name: 'owner_id' })
  owner!: User;

  @Column({ nullable: true })
  image!: string;

  @Column({ nullable: true })
  description!: string;
}