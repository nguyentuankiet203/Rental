import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { Contract, ContractStatus } from './contract.entity';
import { Room } from '../rooms/room.entity';
import { User } from '../users/user.entity';
import { CreateContractDto } from './dto/create-contract.dto';
import { RoomStatus } from '../common/enum/enum_status';
import { Role } from '../common/enum/role.enum';

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract)
    private contractRepo: Repository<Contract>,

    @InjectRepository(Room)
    private roomRepo: Repository<Room>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(user, dto: CreateContractDto) {
    return this.contractRepo.manager.transaction(async (manager) => {
      
      const room = await manager.findOne(Room, {
        where: { id: dto.room_id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!room) throw new NotFoundException();

      const roomWithOwner = await manager.findOne(Room, {
        where: { id: dto.room_id },
        relations: ['property', 'property.owner'],
      });

      if (
        user.role !== Role.ADMIN &&
        roomWithOwner?.property?.owner?.id !== user.id
      ) {
        throw new ForbiddenException();
      }

      if (room.status === RoomStatus.OCCUPIED) {
        throw new ForbiddenException('Room already occupied');
      }

      const tenant = await manager.findOne(User, {
        where: { id: dto.tenant_id },
      });

      if (!tenant) throw new NotFoundException();

      const active = await manager.findOne(Contract, {
        where: {
          tenant: { id: tenant.id },
          status: ContractStatus.ACTIVE,
        },
      });

      if (active) {
        throw new ForbiddenException('Tenant already has active contract');
      }
      
      const contract = manager.create(Contract, {
        room,
        tenant,
        start_date: dto.start_date,
        end_date: dto.end_date,
        rent_price: room.price_per_month,
        status: ContractStatus.ACTIVE,
      });

      room.status = RoomStatus.OCCUPIED;

      await manager.save(room);
      await manager.save(contract);

      return contract;
    });
  }

  @Cron('0 * * * *')
  async activateContracts() {
    const now = new Date();

    const contracts = await this.contractRepo.find({
      where: { status: ContractStatus.PENDING },
      relations: ['room'],
    });

    for (const c of contracts) {
      if (new Date(c.start_date) <= now) {
        c.status = ContractStatus.ACTIVE;
        c.room.status = RoomStatus.OCCUPIED;

        await this.contractRepo.save(c);
      }
    }
  }

  async endContract(user, id: number) {
    return this.contractRepo.manager.transaction(async (manager) => {

      const contract = await manager.findOne(Contract, {
        where: { id },
        relations: ['room', 'room.property', 'room.property.owner'],
      });

      if (!contract) throw new NotFoundException();

      if (
        user.role !== Role.ADMIN &&
        contract.room.property.owner.id !== user.id
      ) {
        throw new ForbiddenException();
      }

      contract.status = ContractStatus.ENDED;
      contract.end_date = new Date();

      contract.room.status = RoomStatus.AVAILABLE;

      await manager.save(Room, contract.room);
      return manager.save(Contract, contract);
    });
  }

  @Cron('0 0 * * *')
  async expireContracts() {
    const now = new Date();

    const contracts = await this.contractRepo.find({
      where: { status: ContractStatus.ACTIVE },
      relations: ['room'],
    });

    for (const c of contracts) {
      if (c.end_date && new Date(c.end_date) < now) {
        c.status = ContractStatus.EXPIRED;
        c.room.status = RoomStatus.AVAILABLE;

        await this.contractRepo.save(c);
      }
    }
  }

  async findAll(user) {
    if (user.role === Role.ADMIN) {
      return this.contractRepo.find({
        relations: [
          "room",
          "room.property",
          "tenant",
        ],
      });
    }
    if (user.role === Role.LANDLORD) {
      return this.contractRepo
        .createQueryBuilder("contract")
        .leftJoinAndSelect(
          "contract.room",
          "room",
        )
        .leftJoinAndSelect(
          "room.property",
          "property",
        )
        .leftJoinAndSelect(
          "property.owner",
          "owner",
        )
        .leftJoinAndSelect(
          "contract.tenant",
          "tenant",
        )
        .where("owner.id = :id", {
          id: user.id,
        })
        .getMany();
    }

    if (user.role === Role.TENANT) {
      return this.contractRepo.find({
        where: {
          tenant: { id: user.id },
        },
        relations: [
          "room",
          "room.property",
        ],
      });
    }
    throw new ForbiddenException();
  }

  async getContracts(query: any, landlordId: number) {
    const {
      propertyId,
      status,
      search,
      page = 1,
      limit = 10,
    } = query;

    const qb = this.contractRepo
      .createQueryBuilder("c")
      .leftJoinAndSelect("c.room", "r")
      .leftJoinAndSelect("r.property", "p")
      .leftJoinAndSelect("c.tenant", "t")
      .where("p.owner_id = :landlordId", { landlordId });

    if (propertyId) {
      qb.andWhere("p.id = :propertyId", { propertyId });
    }

    if (status) {
      qb.andWhere("c.status = :status", { status });
    }

    if (search) {
      qb.andWhere(
        `(t.name ILIKE :search OR t.email ILIKE :search)`,
        { search: `%${search}%` }
      );
    }

    qb.orderBy("c.created_at", "DESC");

    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async getMyContracts(query: any, tenantId: number) {
    return this.contractRepo.find({
      where: {
        tenant: {
          id: tenantId,
        },
      },
      relations: [
        "room",
        "room.property",
      ],
      order: {
        created_at: "DESC",
      },
    });
  }
}