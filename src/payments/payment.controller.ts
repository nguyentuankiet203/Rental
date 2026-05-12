import { Controller, Get, Query, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private service: PaymentService) {}

  @Get(':invoiceId')
  create(@Param('invoiceId') invoiceId: string) {
    const id = Number(invoiceId);
    return this.service.createPayment(id);
  }

  @Get('return')
  handleReturn(@Query() query: any) {
    return this.service.handleReturn(query);
  }
}