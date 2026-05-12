import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Notification } from './notification.entity'
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private repo: Repository<Notification>,
    private gateway: NotificationGateway,
  ) {}

  async getMyNotifications(userId: number) {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }

  async markAsRead(id: number) {
    await this.repo.update(id, { isRead: true });
  }

  async markAllAsRead(userId: number) {
    await this.repo.update(
      { userId, isRead: false },
      { isRead: true },
    );
  }

  async countUnread(userId: number) {
    return this.repo.count({
      where: { userId, isRead: false },
    });
  }
}