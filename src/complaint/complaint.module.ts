import { Module } from '@nestjs/common';
import { ComplaintService } from './complaint.service';
import { ComplaintController } from './complaint.controller';
import { MailingService } from 'src/common/messaging/mailing/mailing.service';
import { MessagingQueueProducer } from 'src/common/messaging/queue/producer';
import { BullModule } from '@nestjs/bull';
import { QUEUE } from 'src/common/messaging/interfaces';

@Module({
  controllers: [ComplaintController],
  providers: [ComplaintService, MailingService, MessagingQueueProducer],
  imports: [BullModule.registerQueue({ name: QUEUE })],
})
export class ComplaintModule {}
