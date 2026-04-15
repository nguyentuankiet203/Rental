import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enum/role.enum';
import { Request } from 'express';
import type { JwtUser } from '../common/types/jwt-user.type';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../users/user.entity';
import { AssignTenantDto } from './dto/assign-tenant.dto';
import { Req } from '@nestjs/common';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('rooms')
export class RoomsController {
  constructor(private readonly service: RoomService) {}

  @Post()
  @Roles(Role.ADMIN, Role.LANDLORD)
  create(@GetUser() user: JwtUser, @Body() dto: CreateRoomDto) {
    console.log('POST HIT');
    return this.service.create(user, dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.LANDLORD)
    findAll(@Req() req) {
      return this.service.findAll(req.user);
    }

  @Get('my-room')
  @Roles(Role.TENANT)
  getMyRoom(@Req() req) {
    return this.service.getMyRoom(req.user);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.LANDLORD)
  update(@Req() req, @Param('id') id: string, @Body() dto) {
    return this.service.update(req.user, +id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.LANDLORD)
  remove(@Req() req, @Param('id') id: string) {
    return this.service.remove(req.user, +id);
  }

  @Patch(':id/assign')
  @Roles(Role.ADMIN, Role.LANDLORD)
  assign(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: AssignTenantDto,
  ) {
    return this.service.assignTenant(req.user, +id, dto);
  }
}