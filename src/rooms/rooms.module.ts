import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomService } from './room.service';
import { Room } from './room.entity';
import { Property } from '../properties/property.entity';
import { User } from '../users/user.entity';
import { RoomsController } from './room.controller';
@Module({
  imports: [
    TypeOrmModule.forFeature([Room, Property, User]),
  ],
  providers: [RoomService],
  controllers: [RoomsController],
  exports: [RoomService],
})
export class RoomsModule {}