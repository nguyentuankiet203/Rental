import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('invoices')
@UseGuards(AuthGuard('jwt'))
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  getInvoices(@Req() req, @Query() query) {
    return this.invoiceService.getInvoices(query, req.user.id);
  }

  @Get('my')
  getMyInvoices(@GetUser() user, @Query() query) {
    return this.invoiceService.getMyInvoices(query, user.id);
  }

  @Post(':id/pay')
  pay(
    @Param('id') id: string,
    @GetUser() user: any
  ) {
    return this.invoiceService.payInvoice(
      Number(id),
      user.id
    );
  }

  @Get('analytics/summary')
  getSummary(@Req() req, @Query('propertyIds') propertyIds: string) {
    const ids = propertyIds
      ? propertyIds.split(',').map(Number)
      : [];

    return this.invoiceService.getInvoiceSummary(req.user.id, ids);
  }

  @Get('analytics/revenue')
  getRevenue(
    @Req() req,
    @Query('propertyIds') propertyIds: string,
    @Query('year') year: number
  ) {
    const ids = propertyIds
      ? propertyIds.split(',').map(Number)
      : [];

    return this.invoiceService.getRevenueChart(
      req.user.id,
      ids,
      Number(year)
    );
  }
}