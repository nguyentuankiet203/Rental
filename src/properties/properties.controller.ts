import { Controller, Get, Post, Body, Patch, Delete, Req, Param, UseGuards } from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enum/role.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('properties')
export class PropertyController {
  constructor(private readonly service: PropertyService) {}

  @Post()
  @Roles(Role.ADMIN, Role.LANDLORD)
  create(@Req() req, @Body() dto: CreatePropertyDto) {
    return this.service.create(req.user, dto);  // req.user là User object từ JWT strategy
  }

  @Get()
  @Roles(Role.ADMIN, Role.LANDLORD)
  findAll(@Req() req) {
    return this.service.findAll(req.user);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.LANDLORD)
  findOne(@Req() req, @Param('id') id: string) {
    return this.service.findOne(req.user, +id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.LANDLORD)
  update(@Req() req, @Param('id') id: string, @Body() dto: Partial<CreatePropertyDto>) {
    return this.service.update(req.user, +id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.LANDLORD)
  remove(@Req() req, @Param('id') id: string) {
    return this.service.remove(req.user, +id);
  }
}