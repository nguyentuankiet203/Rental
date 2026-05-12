import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Req,
  UseGuards, Patch
} from '@nestjs/common';
import { NotificationService } from '../notification/notification.service';
import { GetUser } from '../common/decorators/get-user.decorator';
import { AuthGuard } from '@nestjs/passport';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationController {
  constructor(private service: NotificationService) {}

  @Get()
  @Get()
  getMy(@GetUser() user) {
    return this.service.getMyNotifications(user.id);
  }

  @Get('unread-count')
  count(@GetUser() user) {
    return this.service.countUnread(user.id);
  }

  @Patch(':id/read')
  mark(@Param('id') id: number) {
    return this.service.markAsRead(id);
  }

  @Post('read-all')
  markAll(@Req() user) {
    return this.service.markAllAsRead(user.id);
  }
}