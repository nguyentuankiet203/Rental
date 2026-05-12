import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Invoice } from './invoice.entity';
import { Room } from '../rooms/room.entity';
import { Utility } from '../utilities/utility.entity';
import { Notification } from '../notification/notification.entity';
import { NotificationModule } from '../notification/notification.module';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, Room, Notification, Utility]),
  NotificationModule],
  providers: [InvoiceService],
  controllers: [InvoiceController],
})
export class InvoiceModule {}