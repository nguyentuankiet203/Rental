import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { GetUser } from '../common/decorators/get-user.decorator';

import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService,) {}

  @Get()
  getDashboard(
    @Req() req,
    @Query('propertyId') propertyId?: string
  ) {
    const landlordId = req.user.id;

    return this.service.getDashboard(
      landlordId,
      propertyId ? Number(propertyId) : undefined
    );
  }

  @Get('revenue')
  getRevenueChart(
    @GetUser() user,
    @Query('propertyIds') propertyIds?: string,
    @Query('year') year?: string,
  ) {
    const ids = propertyIds
      ? propertyIds.split(',').map((i) => Number(i))
      : [];

    return this.service.getRevenueMulti(
      user.id,
      ids,
      year ? Number(year) : undefined,
    );
  }
}