import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository, } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository, Like } from 'typeorm';
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UploadService } from "../upload/upload.service";
import { Role } from '../common/enum/role.enum';
import { Req } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private uploadService: UploadService,
  ) {}

  async createUser(
    dto: CreateUserDto,
    currentUser: any,
    file?: Express.Multer.File,
  ) {
    const existing = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (existing) {
      throw new BadRequestException("Email already exists");
    }

    // LANDLORD không được tạo ADMIN
    if (
      currentUser.role === Role.LANDLORD &&
      dto.role === Role.ADMIN
    ) {
      throw new ForbiddenException(
        "Bạn không có quyền tạo admin",
      );
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    let avatarUrl: string | undefined = undefined;

    if (file?.buffer) {
      avatarUrl = await this.uploadService.uploadFile(
        file,
        "avatars",
      );
    }

    const user = this.userRepo.create({
      email: dto.email,
      password: hashed,
      role: dto.role,
      name: dto.name,
      phone: dto.phone,
      avatar: avatarUrl,
      created_by: currentUser.id,
    });

    return this.userRepo.save(user);
  }

  async findAll(query: any, currentUser: User) {
    const { page = 1, limit = 10, search = "" } = query;

    const qb = this.userRepo.createQueryBuilder("u");

    // ADMIN thấy tất cả
    if (currentUser.role !== Role.ADMIN) {
      qb.andWhere("u.role != :adminRole", {
        adminRole: Role.ADMIN,
      });

      qb.andWhere("u.created_by = :userId", {
        userId: currentUser.id,
      });
    }

    if (search) {
      qb.andWhere(
        "(u.name ILIKE :search OR u.email ILIKE :search)",
        {
          search: `%${search}%`,
        }
      );
    }

    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
    };
  }

  async update(
    id: number,
    dto: UpdateUserDto,
    file?: Express.Multer.File,
  ) {
    const user = await this.userRepo.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (file) {
      const avatarUrl = await this.uploadService.uploadFile(
        file,
        "avatars",
      );

      user.avatar = avatarUrl;
    }

    Object.assign(user, dto);

    return this.userRepo.save(user);
  }

  async deleteUser(id: number) {
    const result = await this.userRepo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
    return { message: 'User deleted successfully' };
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }
}