import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { MailingService } from 'src/common/messaging/mailing/mailing.service';
import { MessagingQueueProducer } from 'src/common/messaging/queue/producer';
import { BullModule } from '@nestjs/bull';
import { QUEUE } from 'src/common/messaging/interfaces';

@Module({
  controllers: [AdminController],
  providers: [AdminService, MailingService, MessagingQueueProducer],
  imports: [BullModule.registerQueue({ name: QUEUE })],
})
export class AdminModule {}
