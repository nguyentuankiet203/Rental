import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Room } from '../rooms/room.entity';
import { Utility } from '../utilities/utility.entity';
import { Notification } from '../notification/notification.entity';
import { NotificationController } from '../notification/notification.controller';
import { NotificationService } from '../notification/notification.service';
import { NotificationGateway } from './notification.gateway';


@Module({
  imports: [TypeOrmModule.forFeature([ Notification] )],
  providers: [NotificationService,NotificationGateway,],
  controllers: [NotificationController],
  exports: [NotificationGateway],
})
export class NotificationModule {}