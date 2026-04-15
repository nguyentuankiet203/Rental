import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from './room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { Property } from '../properties/property.entity';
import { AssignTenantDto } from './dto/assign-tenant.dto';
import { RoomStatus } from 'src/common/enum/enum_status';
import { User } from '../users/user.entity';
import { Role } from '../common/enum/role.enum';
import { In } from 'typeorm';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Room)
    private repo: Repository<Room>,

    @InjectRepository(Property)
    private propertyRepo: Repository<Property>,
  ) {}

  async create(user, dto: CreateRoomDto) {
    const property = await this.propertyRepo.findOne({
      where: { id: dto.property_id },
      relations: ['owner'],
    });
    if (!property) throw new NotFoundException();

    if (
      user.role !== 'ADMIN' &&
      property.owner.id !== user.id
    ) {
      throw new ForbiddenException();
    }
    return this.repo.save({
      name: dto.name,
      price: dto.price,
      property: property,
      status: RoomStatus.AVAILABLE
    });
  }

  async findAll(user) {
    if (user.role === 'ADMIN') {
      return this.repo.find();
    }
    if (user.role === 'LANDLORD') {
      return this.repo
        .createQueryBuilder('room')
        .leftJoinAndSelect('room.property', 'p')
        .leftJoinAndSelect('p.owner', 'owner')
        .where('owner.id = :id', { id: user.id })
        .getMany();
    }
    throw new ForbiddenException();
  }

    async getMyRoom(user) {
    const room = await this.repo.findOne({
      where: { tenant: { id: user.id } },
      relations: ['tenant', 'property'],
    });
    if (!room) {
      throw new NotFoundException('No room assigned');
    }
    return room;
  }

  async assignTenant(user, roomId: number, dto: AssignTenantDto) {
    const room = await this.repo.findOne({
      where: { id: roomId },
      relations: ['property', 'property.owner'],
    });
    if (!room) throw new NotFoundException();

    const property = room.property;
    if (!property) throw new NotFoundException('Property not found');

    if (
      user.role !== 'ADMIN' &&
      property.owner.id !== user.id
    ) {
      throw new ForbiddenException();
    }

    const tenant = await this.userRepo.findOne({
      where: { id: dto.tenant_id },
    });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    room.tenant = tenant;
    room.status = RoomStatus.OCCUPIED;
    return this.repo.save(room);
  }

  async update(user, id: number, dto: Partial<CreateRoomDto>) {
    const room = await this.repo.findOne({ 
      where: { id },
      relations: ['property', 'property.owner']
    });
    if (!room) throw new NotFoundException();
    
    const property = room.property;
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    if (
      user.role !== 'ADMIN' &&
      property.owner.id !== user.id
    ) {
      throw new ForbiddenException();
    }
    Object.assign(room, dto);
    return this.repo.save(room);
  }

  async remove(user, id: number) {
    const room = await this.repo.findOne({ 
      where: { id },
      relations: ['property', 'property.owner']
    });
    if (!room) throw new NotFoundException();
    
    const property = room.property;
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    if (
      user.role !== 'ADMIN' &&
      property.owner.id !== user.id
    ) {
      throw new ForbiddenException();
    }
    return this.repo.remove(room);
  }
}