import { Injectable, NotFoundException,BadRequestException, ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from './room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { Property } from '../properties/property.entity';
import { RoomStatus } from 'src/common/enum/enum_status';
import { Contract } from '../contracts/contract.entity';
import { ContractStatus } from '../contracts/contract.entity';
import { User } from '../users/user.entity';
import { Role } from '../common/enum/role.enum';
import { JwtUser } from '../common/types/jwt-user.type';
import { CreateBulkRoomDto } from './dto/createbulkroomdto';
import { ImportRoomDto } from './dto/importroomdto';
import { UploadService } from "../upload/upload.service";
import { RoomImage } from "./room-image.entity";

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private repo: Repository<Room>,
    private readonly uploadService: UploadService,

    @InjectRepository(RoomImage)
    private readonly roomImageRepo: Repository<RoomImage>,
    
    @InjectRepository(Property)
    private propertyRepo: Repository<Property>,
    
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Contract)
    private contractRepo: Repository<Contract>,
  ) {}

  async create(user, dto: CreateRoomDto) {
    const property = await this.propertyRepo.findOne({
      where: { id: dto.property_id },
      relations: ["owner"],
    });

    if (!property) throw new NotFoundException();

    if (user.role !== Role.ADMIN && property.owner.id !== user.id) {
      throw new ForbiddenException();
    }

    const room = await this.repo.save({
      name: dto.name,
      price_per_month: dto.price_per_month,
      property,
      status: RoomStatus.AVAILABLE,
    });

    return this.repo.findOne({
      where: { id: room.id },
      relations: ["property"],
    });
  }

  async uploadRoomImages(roomId: number, files: Express.Multer.File[]) {
    const images = await Promise.all(
      files.map(async (file) => {
        const url = await this.uploadService.uploadFile(
          file,
          `rooms/${roomId}`
        );

        return this.roomImageRepo.create({
          room_id: roomId,
          image_url: url,
        });
      })
    );

    return this.roomImageRepo.save(images);
  }

  async findOne(user: JwtUser, id: number) {
    const qb = this.repo
      .createQueryBuilder("room")

      .leftJoinAndSelect("room.property", "property")
      .leftJoinAndSelect("property.owner", "owner")
      .leftJoinAndSelect("room.images", "images")
      .leftJoin(
        Contract,
        "contract",
        "contract.room_id = room.id AND contract.status = :status",
        { status: ContractStatus.ACTIVE }
      )

      .leftJoin(
        User,
        "tenant",
        "tenant.id = contract.tenant_id"
      )

      .addSelect([
        "contract.id",
        "tenant.id",
        "tenant.email",
        "tenant.name",
      ])

      .where("room.id = :id", { id });

    const { entities, raw } = await qb.getRawAndEntities();

    const room = entities[0];
    const r = raw[0];

    if (!room) throw new NotFoundException();

    if (
      user.role !== Role.ADMIN &&
      room.property.owner.id !== user.id
    ) {
      throw new ForbiddenException();
    }

    return {
      ...room,
      currentTenant: r?.tenant_id
        ? {
            id: r.tenant_id,
            email: r.tenant_email,
            name: r.tenant_name,
          }
        : null,
      contractId: r?.contract_id || null,
    };
  }

  async findAll(user: JwtUser, propertyId: number) {
    if (!propertyId) {
      throw new BadRequestException("propertyId is required");
    }

    const property = await this.propertyRepo.findOne({
      where: { id: Number(propertyId) },
      relations: ["owner"],
    });

    if (!property) {
      throw new NotFoundException("Property not found");
    }

    if (
      user.role !== Role.ADMIN &&
      property.owner.id !== user.id
    ) {
      throw new ForbiddenException();
    }

    const rooms = await this.repo.find({
      where: { property: { id: Number(propertyId) } },
      relations: ["property", "images"],
    });

    const result = await Promise.all(
      rooms.map(async (room) => {
        const contract = await this.contractRepo.findOne({
          where: {
            room: { id: room.id },
            status: ContractStatus.ACTIVE,
          },
          relations: ["tenant"],
        });

        return {
          ...room,
          currentTenant: contract?.tenant || null,
          contractId: contract?.id || null,
        };
      })
    );

    return result;
  }

  async update(user, id: number, dto: Partial<CreateRoomDto>) {
    const room = await this.repo.findOne({
      where: { id },
      relations: ['property', 'property.owner'],
    });
    if (!room) throw new NotFoundException();

    const property = room.property;

    if (
      user.role !== Role.ADMIN &&
      property.owner.id !== user.id
    ) {
      throw new ForbiddenException();
    }

    room.name = dto.name ?? room.name;
    room.price_per_month = dto.price_per_month ?? room.price_per_month;

    return this.repo.save(room);
  }

  async remove(user, id: number) {
    const room = await this.repo.findOne({
      where: { id },
      relations: ['property', 'property.owner'],
    });
    if (!room) throw new NotFoundException();

    const property = room.property;

    if (
      user.role !== Role.ADMIN &&
      property.owner.id !== user.id
    ) {
      throw new ForbiddenException();
    }

    return this.repo.remove(room);
    }

  async createBulk(user, dto: CreateBulkRoomDto) {
    const { property_id, quantity, price_per_month, start_number } = dto;

    return this.repo.manager.transaction(async (manager) => {

      const property = await manager.findOne(Property, {
        where: { id: property_id },
        relations: ["owner"],
      });

      if (!property) throw new NotFoundException();

      if (
        user.role !== Role.ADMIN &&
        property.owner.id !== user.id
      ) {
        throw new ForbiddenException();
      }

      const lastRoom = await manager.findOne(Room, {
        where: { property: { id: property_id } },
        order: { room_number: "DESC" },
        lock: { mode: "pessimistic_write" },
      });

      let start =
        start_number ??
        (lastRoom ? lastRoom.room_number + 1 : 1);

      const rooms: Room[] = [];

      for (let i = 0; i < quantity; i++) {
        const num = start + i;

        rooms.push(
          manager.create(Room, {
            name: `Phòng ${num}`,
            room_number: num,
            price_per_month,
            property,
            status: RoomStatus.AVAILABLE,
          })
        );
      }
      return manager.save(rooms);
    });
  }

  async importRooms(user, dto: ImportRoomDto) {
    const { property_id, rooms } = dto;

    const property = await this.propertyRepo.findOne({
      where: { id: property_id },
      relations: ["owner"],
    });

    if (!property) throw new NotFoundException();

    if (
      user.role !== Role.ADMIN &&
      property.owner.id !== user.id
    ) {
      throw new ForbiddenException();
    }

    const existing = await this.repo.find({
      where: {
        property: { id: property_id },
      },
    });

    const existingNumbers = new Set(
      existing.map((r) => r.room_number)
    );

    const newRooms = rooms.map((r) => {
      if (existingNumbers.has(r.room_number)) {
        throw new BadRequestException(
          `Room ${r.room_number} already exists`
        );
      }

      return this.repo.create({
        room_number: r.room_number,
        name: `Phòng ${r.room_number}`,
        price_per_month: r.price_per_month,
        property,
        status: RoomStatus.AVAILABLE,
      });
    });

    return this.repo.save(newRooms);
  }
}