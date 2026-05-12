import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  UploadedFiles,
  UseInterceptors,
  Query, ParseIntPipe, Req
} from '@nestjs/common';

import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { CreateBulkRoomDto } from './dto/createbulkroomdto';
import { ImportRoomDto } from './dto/importroomdto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enum/role.enum';
import { GetUser } from '../common/decorators/get-user.decorator';
import { FilesInterceptor } from "@nestjs/platform-express";

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('rooms')
export class RoomsController {
  constructor(private readonly service: RoomService) {}

  @Post()
  @UseInterceptors(FilesInterceptor("images", 10))
  async create(
    @GetUser() user,
    @Body() dto: CreateRoomDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.service.create(user, dto);
  }

  @Post(":roomId/images")
  @UseInterceptors(FilesInterceptor("images", 10))
  async uploadRoomImages(
    @Param("roomId") roomId: number,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.service.uploadRoomImages(roomId, files);
  }

  @Post("bulk")
  @Roles(Role.ADMIN, Role.LANDLORD)
  createBulk(@GetUser() user, @Body() dto: CreateBulkRoomDto) {
    return this.service.createBulk(user, dto);
  }

  @Post("import")
  import(@GetUser() user, @Body() dto: ImportRoomDto) {
    return this.service.importRooms(user, dto);
  }

  @Get("property/:propertyId")
  findByProperty(
    @GetUser() user,
    @Param("propertyId") propertyId: string
  ) {
    return this.service.findAll(user, +propertyId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.LANDLORD)
  findOne(
    @GetUser() user,
    @Param('id') id: string
  ) {
    return this.service.findOne(user, +id);
  }

  @Get()
  @Roles(Role.ADMIN, Role.LANDLORD)
  findAll(
    @GetUser() user,
    @Query("propertyId") propertyId: string
  ) {
    return this.service.findAll(user, +propertyId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.LANDLORD)
  update(
    @GetUser() user,
    @Param('id') id: string,
    @Body() dto,
  ) {
    return this.service.update(user, +id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.LANDLORD)
  remove(@GetUser() user, @Param('id') id: string) {
    return this.service.remove(user, +id);
  }
}