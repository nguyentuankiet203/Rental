import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Utility } from './utility.entity';
import { Room } from '../rooms/room.entity';

import { UtilityService } from './utility.service';
import { UtilityController } from './utility.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Utility, Room])],
  providers: [UtilityService],
  controllers: [UtilityController],
})
export class UtilityModule {}