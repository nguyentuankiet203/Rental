import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Req, Query,
  UseGuards,
} from '@nestjs/common';

import { ContractService } from './contract.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { NotificationService } from '../notification/notification.service';
import { UpdateContractDto } from './dto/update-contract.dto';
import { GetUser } from '../common/decorators/get-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enum/role.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('contracts')
export class ContractController {
  constructor(private readonly service: ContractService) {}

  @Post()
  @Roles(Role.ADMIN, Role.LANDLORD)
  create(@Req() req, @Body() dto: CreateContractDto) {
    return this.service.create(req.user, dto);
  }

  @Get()
  getContracts(
    @Req() req,
    @Query() query
  ) {
    return this.service.getContracts(query, req.user.id);
  }

  @Get("my")
  getMyContracts(
    @GetUser() user,
    @Query() query
  ) {
    return this.service.getMyContracts(
      query,
      user.id
    );
  }

  @Get(":id")
  @Roles(Role.LANDLORD)
  getById(
    @Param("id") id: number,
    @Req() req,
  ) {
    return this.service.getContractById(
      +id,
      req.user.id,
    );
  }

  @Patch(":id")
  @Roles(Role.LANDLORD)
  update(
    @Param("id") id: number,
    @Body() dto: UpdateContractDto,
    @Req() req,
  ) {
    return this.service.updateContract(
      +id,
      req.user.id,
      dto,
    );
  }

  @Patch(':id/end')
  @Roles(Role.ADMIN, Role.LANDLORD)
  end(@Req() req, @Param('id') id: number) {
    return this.service.endContract(req.user, id);
  }
}