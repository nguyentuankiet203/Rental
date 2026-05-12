import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Contract } from './contract.entity';
import { Room } from '../rooms/room.entity';
import { User } from '../users/user.entity';

import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Contract, Room, User])],
  providers: [ContractService],
  controllers: [ContractController],
})
export class ContractModule {}