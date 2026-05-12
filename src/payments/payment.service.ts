import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Payment } from './payment.entity';
import { Invoice } from '../invoice/invoice.entity';
import { Notification } from '../notification/notification.entity';
import { NotificationGateway } from '../notification/notification.gateway';
import { NotificationType } from '../notification/notification.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,

    @InjectRepository(Invoice)
    private invoiceRepo: Repository<Invoice>,

    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,

    private gateway: NotificationGateway,
  ) {}

  async createPayment(invoiceId: number) {
    const invoice = await this.invoiceRepo.findOne({
      where: { id: invoiceId },
    });

    if (!invoice) throw new NotFoundException('Invoice not found');

    const url = `http://localhost:3000/payment-return?invoiceId=${invoiceId}&amount=${invoice.total_amount}`;

    return { url };
  }

  async handleReturn(query: any) {
    const { invoiceId, amount } = query;

    const invoice = await this.invoiceRepo.findOne({
      where: { id: Number(invoiceId) },
      relations: ['contract', 'contract.tenant'],
    });

    if (!invoice) throw new NotFoundException();

    invoice.status = 'PAID';
    invoice.paid_at = new Date();
    await this.invoiceRepo.save(invoice);

    await this.paymentRepo.save({
      invoice,
      method: 'VNPAY',
      amount: Number(amount),
      transaction_code: 'MOCK_' + Date.now(),
      status: 'SUCCESS',
    });

    const noti = await this.notificationRepo.save({
      userId: invoice.contract.tenant.id,
      title: 'Thanh toán thành công',
      message: `Bạn đã thanh toán hóa đơn tháng ${invoice.month}`,
      type: NotificationType.INVOICE,
      refId: invoice.id,
      isRead: false,
    });

    this.gateway.sendToUser(
      invoice.contract.tenant.id,
      noti
    );

    return { success: true };
  }
}