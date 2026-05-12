import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomService } from './room.service';
import { Room } from './room.entity';
import { RoomImage } from './room-image.entity';
import { Property } from '../properties/property.entity';
import { Contract } from '../contracts/contract.entity';
import { User } from '../users/user.entity';
import { RoomsController } from './room.controller';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room, Property, User, Contract, RoomImage]),
    UploadModule,
  ],
  providers: [RoomService],
  controllers: [RoomsController],
  exports: [RoomService],
  
})
export class RoomsModule {}