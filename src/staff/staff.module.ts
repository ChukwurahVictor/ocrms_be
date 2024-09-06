import { Module } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { MailingService } from 'src/common/messaging/mailing/mailing.service';
// import { MessagingQueueConsumer } from 'src/common/messaging/queue/consumer';
import { MessagingQueueProducer } from 'src/common/messaging/queue/producer';
import { QUEUE } from 'src/common/messaging/interfaces';
import { BullModule } from '@nestjs/bull';

@Module({
  controllers: [StaffController],
  providers: [
    StaffService,
    MailingService,
    // MessagingQueueConsumer,
    MessagingQueueProducer,
  ],
  imports: [BullModule.registerQueue({ name: QUEUE })],
})
export class StaffModule {}
