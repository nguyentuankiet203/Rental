import { Injectable,
  NotFoundException, ForbiddenException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Invoice, InvoiceStatus } from './invoice.entity';
import { Notification, NotificationType } from '../notification/notification.entity';
import { NotificationGateway } from '../notification/notification.gateway';
// import { Payment } from '../payments/payment.entity';

import { Cron } from '@nestjs/schedule';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepo: Repository<Invoice>,
    private dataSource: DataSource,

    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    private notificationGateway: NotificationGateway,
    private gateway: NotificationGateway,
  ) {}

  async getInvoices(query: any, landlordId: number) {
    const { propertyId, status, month, page = 1, limit = 10 } = query;

    const qb = this.invoiceRepo
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.contract', 'c')
      .leftJoinAndSelect('c.room', 'r')
      .leftJoinAndSelect('r.property', 'p')
      .leftJoinAndSelect('c.tenant', 't')
      .where('p.owner_id = :landlordId', { landlordId });

    if (propertyId) qb.andWhere('p.id = :propertyId', { propertyId });
    if (status) qb.andWhere('i.status = :status', { status });
    if (month) qb.andWhere('i.month = :month', { month });

    qb.orderBy('i.created_at', 'DESC');

    qb.skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async payInvoice(id: number, userId: number) {
    const invoice = await this.invoiceRepo.findOne({
      where: { id },
      relations: ['contract', 'contract.tenant'],
    });

    if (!invoice) throw new NotFoundException();

    if (invoice.contract.tenant.id !== userId) {
      throw new ForbiddenException();
    }

    invoice.status = InvoiceStatus.PAID;
    invoice.paid_at = new Date();

    await this.invoiceRepo.save(invoice);
    // await this.notificationRepo.save({
    //   userId: invoice.contract.tenant.id,
    //   title: "Thanh toán thành công",
    //   message: `Bạn đã thanh toán hóa đơn tháng ${invoice.month}`,
    //   type: NotificationType.INVOICE,
    //   ref_id: invoice.id,
    //   is_read: false,
    // });
    const noti = await this.notificationRepo.save({
      userId: invoice.contract.tenant.id,
      title: "Thanh toán thành công",
      message: `Bạn đã thanh toán hóa đơn tháng ${invoice.month}`,
      type: NotificationType.INVOICE,
      refId: invoice.id,
      isRead: false,
    });
    this.notificationGateway.sendToUser(
      invoice.contract.tenant.id,
      noti
    );

    return { message: 'Paid successfully' };
  }

  async getMyInvoices(query: any, tenantId: number) {
    const { status, month, page = 1, limit = 10 } = query;

    const qb = this.invoiceRepo
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.contract', 'c')
      .leftJoinAndSelect('c.room', 'r')
      .leftJoinAndSelect('r.property', 'p')
      .where('c.tenant_id = :tenantId', { tenantId });

    if (status) qb.andWhere('i.status = :status', { status });
    if (month) qb.andWhere('i.month = :month', { month });

    qb.orderBy('i.created_at', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  @Cron('0 0 7 * *', {
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  // @Cron('*/1 * * * *')
  async generateInvoices() {
    const now = new Date();
    now.setMonth(now.getMonth() );

    const month = now.toISOString().slice(0, 7);

    await this.dataSource.query(
      `
      INSERT INTO invoices (contract_id, month, due_date, base_rent, total_amount)
      SELECT 
        c.id,
        $1,
        (DATE_TRUNC('month', CURRENT_DATE) + interval '10 days')::date,
        c.rent_price,
        c.rent_price
      FROM contracts c
      WHERE c.status = 'ACTIVE'
        AND c.start_date <= DATE_TRUNC('month', CURRENT_DATE)
      ON CONFLICT (contract_id, month) DO NOTHING
    `,
      [month]
    );
     console.log('AUTO GENERATED INVOICES');
  }

  async getInvoiceSummary(landlordId: number, propertyIds?: number[]) {
    let query = `
      SELECT
        COALESCE(SUM(i.total_amount) FILTER (WHERE i.status = 'PAID'), 0) AS total_paid,
        COALESCE(SUM(i.total_amount) FILTER (WHERE i.status = 'UNPAID'), 0) AS total_unpaid,
        COALESCE(SUM(i.total_amount) FILTER (WHERE i.status = 'OVERDUE'), 0) AS total_overdue,
        COUNT(*) FILTER (WHERE i.status = 'OVERDUE') AS overdue_count
      FROM invoices i
      JOIN contracts c ON c.id = i.contract_id
      JOIN rooms r ON r.id = c.room_id
      JOIN properties p ON p.id = r.property_id
      WHERE p.owner_id = $1
    `;

    const params: any[] = [landlordId];

    if (propertyIds?.length) {
      query += ` AND p.id = ANY($2)`;
      params.push(propertyIds);
    }

    const result = await this.dataSource.query(query, params);
    return result[0];
  }

  async getRevenueChart(
    landlordId: number,
    propertyIds: number[],
    year: number
  ) {
    const result = await this.dataSource.query(
      `
      SELECT
        TO_CHAR(month_series, 'YYYY-MM') AS month,
        p.id AS property_id,
        COALESCE(SUM(i.total_amount), 0) AS revenue

      FROM generate_series(
        DATE_TRUNC('year', make_date($3, 1, 1)),
        DATE_TRUNC('year', make_date($3, 1, 1)) + interval '11 months',
        interval '1 month'
      ) AS month_series

      CROSS JOIN (
        SELECT id
        FROM properties
        WHERE owner_id = $1
        AND id = ANY($2)
      ) p

      LEFT JOIN rooms r
        ON r.property_id = p.id

      LEFT JOIN contracts c
        ON c.room_id = r.id

      LEFT JOIN invoices i
        ON i.contract_id = c.id
        AND i.status = 'PAID'
        AND TO_DATE(i.month, 'YYYY-MM') = month_series

      GROUP BY month_series, p.id
      ORDER BY month_series, p.id
      `,
      [landlordId, propertyIds, year]
    );

    return result;
  }

  @Cron('0 9 * * *', {
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  // @Cron('*/1 * * * *')
  async markOverdueAndNotify() {
    console.log('RUN OVERDUE CRON');

    const overdueInvoices = await this.invoiceRepo
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.contract', 'c')
      .leftJoinAndSelect('c.tenant', 't')
      .where('i.status = :status', {
        status: 'UNPAID',
      })
      .andWhere('i.due_date < CURRENT_DATE')
      .getMany();

    console.log(overdueInvoices);

    for (const inv of overdueInvoices) {
      // update status
      inv.status = 'OVERDUE';

      await this.invoiceRepo.save(inv);

      // tạo notification
      const noti = await this.notificationRepo.save({
        userId: inv.contract.tenant.id,
        title: 'Hóa đơn quá hạn',
        message: `Bạn có hóa đơn tháng ${inv.month} chưa thanh toán`,
        type: NotificationType.INVOICE,
        ref_id: inv.id,
        isRead: false,
      });
      console.log(noti);
      // realtime socket
      this.notificationGateway.sendToUser(
        inv.contract.tenant.id,
        noti,
      );

      console.log('SEND NOTIFICATION');
    }
  }
}
