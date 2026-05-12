import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module';
import { RoomsModule } from './rooms/rooms.module';
import * as dotenv from 'dotenv';
import { ConfigModule } from '@nestjs/config';
import { PropertyModule } from './properties/property.module';
import { DashboardModule } from './dashboard/dashboard.module'
import { ContractModule } from './contracts/contracts.module';
import { UtilityModule } from './utilities/utility.module';
import { InvoiceModule } from './invoice/invoice.module';
import { NotificationModule } from './notification/notification.module';
import { PaymentModule } from './payments/payment.module';
import { UploadModule } from "./upload/upload.module";
import { ScheduleModule } from '@nestjs/schedule';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');
dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: true,
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
        family: 4,
      },

      autoLoadEntities: true,
      synchronize: true,
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    AuthModule,
    PropertyModule,
    RoomsModule,
    ContractModule,
    DashboardModule,
    UtilityModule,
    InvoiceModule,
    NotificationModule,
    PaymentModule,
    UploadModule,
    ScheduleModule.forRoot(),
  ],
  
})
export class AppModule {}