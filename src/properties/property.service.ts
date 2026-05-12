import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from './property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { Role } from '../common/enum/role.enum';
import { User } from '../users/user.entity';
import { UploadService } from "../upload/upload.service";

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private readonly repo: Repository<Property>,
    private readonly uploadService: UploadService,
  ) {}

  async create(user: any, dto: any, file: Express.Multer.File) {
    let imageUrl = null;
    if (file?.buffer) {
      imageUrl = await this.uploadService.uploadFile(file, "properties");
    }
    const property = this.repo.create({
      ...dto,
      owner: user,
      image: imageUrl,
    });
    return this.repo.save(property);
  }


  async findAll(user: User) {
    if (user.role === Role.ADMIN) {
      return this.repo.find();
    }
    return this.repo.find({
      where: { owner: { id: user.id } },
      relations: ['owner'],
    });
  }

  async findOne(user: User, propertyId: number) {
    const property = await this.repo.findOne({
      where: { id: propertyId },
      relations: ['owner'],
    });
    if (!property) throw new NotFoundException();
    if (user.role !== Role.ADMIN && property.owner.id !== user.id) {
      return null;
    }
    return property;
  }
  async update(
    user: User,
    id: number,
    dto: Partial<CreatePropertyDto>,
    file?: Express.Multer.File,
  ) {
    const property = await this.repo.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (
      user.role !== Role.ADMIN &&
      property.owner.id !== user.id
    ) {
      throw new ForbiddenException(
        'You cannot update this property',
      );
    }

    // upload image mới
    if (file?.buffer) {
      const imageUrl = await this.uploadService.uploadFile(
        file,
        'properties',
      );

      property.image = imageUrl;
    }

    // update data
    Object.assign(property, dto);

    return this.repo.save(property);
  }

  async remove(user: User, id: number) {
    const property = await this.repo.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!property) throw new NotFoundException();
    
    if (user.role !== Role.ADMIN && property.owner.id !== user.id) {
      throw new ForbiddenException();
    }
    
    return this.repo.remove(property);
  }
}