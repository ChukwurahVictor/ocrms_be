import { Module } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { MailingService } from 'src/common/messaging/mailing/mailing.service';
import { MessagingQueueProducer } from 'src/common/messaging/queue/producer';
import { QUEUE } from 'src/common/messaging/interfaces';
import { BullModule } from '@nestjs/bull';

@Module({
  controllers: [StaffController],
  providers: [StaffService, MailingService, MessagingQueueProducer],
  imports: [BullModule.registerQueue({ name: QUEUE })],
})
export class StaffModule {}
