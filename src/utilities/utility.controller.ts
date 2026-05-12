import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';

import { UtilityService } from './utility.service';
import { CreateUtilityDto } from './dto/create-utility.dto';

import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enum/role.enum';
import { GetUser } from '../common/decorators/get-user.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('utilities')
export class UtilityController {
  constructor(private readonly service: UtilityService) {}

  @Post()
  @Roles(Role.ADMIN, Role.LANDLORD)
  create(@GetUser() user, @Body() dto: CreateUtilityDto) {
    return this.service.create(user, dto);
  }

  @Get()
  find(
    @GetUser() user,
    @Query('room_id') roomId?: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    if (roomId) {
      return this.service.findByRoom(user, +roomId);
    }

    if (month && year) {
      return this.service.findByMonth(user, +month, +year);
    }

    return [];
  }
}