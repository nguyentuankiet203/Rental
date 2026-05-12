import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Payment } from './payment.entity';
import { Invoice } from '../invoice/invoice.entity';
import { Notification } from '../notification/notification.entity';

import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';

import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Invoice, Notification]),
    NotificationModule,
  ],
  providers: [PaymentService],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}