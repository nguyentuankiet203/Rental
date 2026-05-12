import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Utility } from './utility.entity';
import { Room } from '../rooms/room.entity';
import { CreateUtilityDto } from './dto/create-utility.dto';
import { Role } from '../common/enum/role.enum';

@Injectable()
export class UtilityService {
  constructor(
    @InjectRepository(Utility)
    private repo: Repository<Utility>,

    @InjectRepository(Room)
    private roomRepo: Repository<Room>,
  ) {}

  async create(user, dto: CreateUtilityDto) {
    const room = await this.roomRepo.findOne({
      where: { id: dto.room_id },
      relations: ['property', 'property.owner'],
    });

    if (!room) throw new NotFoundException('Room not found');

    if (
      user.role !== Role.ADMIN &&
      room.property.owner.id !== user.id
    ) {
      throw new ForbiddenException();
    }

    if (dto.electric_new < dto.electric_old) {
      throw new ForbiddenException('Electric number invalid');
    }

    if (dto.water_new < dto.water_old) {
      throw new ForbiddenException('Water number invalid');
    }

    const utility = this.repo.create({
      ...dto,
      room,
    });

    return this.repo.save(utility);
  }

  async findByRoom(user, roomId: number) {
    const room = await this.roomRepo.findOne({
      where: { id: roomId },
      relations: ['property', 'property.owner'],
    });

    if (!room) throw new NotFoundException();

    if (
      user.role !== Role.ADMIN &&
      room.property.owner.id !== user.id
    ) {
      throw new ForbiddenException();
    }

    return this.repo.find({
      where: { room: { id: roomId } },
    });
  }

  async findByMonth(user, month: number, year: number) {
    return this.repo.find({
      where: { month, year },
    });
  }
}