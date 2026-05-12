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
  findAll(@Req() req) {
    return this.service.findAll(req.user);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  getContracts(
    @Req() req,
    @Query() query
  ) {
    return this.service.getContracts(query, req.user.id);
  }

  // @Get("my")
  // getMyContracts(
  //   @GetUser() user,
  //   @Query() query
  // ) {
  //   return this.service.getMyContracts(
  //     query,
  //     user.id
  //   );
  // }

  @Patch(':id/end')
  @Roles(Role.ADMIN, Role.LANDLORD)
  end(@Req() req, @Param('id') id: number) {
    return this.service.endContract(req.user, id);
  }
}