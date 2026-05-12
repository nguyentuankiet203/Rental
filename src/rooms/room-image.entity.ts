import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Room } from "./room.entity";

@Entity("room_images")
export class RoomImage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  room_id!: number;

  @Column()
  image_url!: string;

  @ManyToOne(() => Room, (room) => room.images, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "room_id" })
  room!: Room;
}