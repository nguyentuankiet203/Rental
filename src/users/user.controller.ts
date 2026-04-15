import {
  UseGuards,
  Controller,
  Get,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../common/enum/role.enum';

@Controller('users')
export class UsersController {

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  findAll() {
    return 'Only admin can access';
  }
  @Get('my-rooms')
  @Roles(Role.LANDLORD)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  myRooms() {
    return 'Only landlord can see own rooms';
  }
  @Get('my-room')
  @Roles(Role.TENANT)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  myRoom() {
    return 'Only tenant can see own room';
  }
}