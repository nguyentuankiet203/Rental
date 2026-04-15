import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from '../common/enum/role.enum';
import { OneToMany } from 'typeorm';
import { Room } from '../rooms/room.entity';
export enum UserRole {
  ADMIN = 'ADMIN',
  LANDLORD = 'LANDLORD',
  TENANT = 'TENANT',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  @Exclude()
  password!: string;

  @Column({ nullable: true })
  name!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.LANDLORD,
  })
  role!: Role;

  @OneToMany(() => Room, (room) => room.tenant)
  rentedRooms!: Room[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}