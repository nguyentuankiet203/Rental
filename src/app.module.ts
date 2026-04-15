import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module';
import { RoomsModule } from './rooms/rooms.module';
import * as dotenv from 'dotenv';
import { ConfigModule } from '@nestjs/config';
import { PropertyModule } from './properties/property.module';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,

      ssl: {
        rejectUnauthorized: false,
      },

      autoLoadEntities: true,
      synchronize: false,
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    AuthModule,
    PropertyModule,
    RoomsModule,
  ],
})
export class AppModule {}