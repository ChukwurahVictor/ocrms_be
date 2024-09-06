import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { JOBS, QUEUE } from '../interfaces';
import { JobOptions, Queue } from 'bull';
import {
  IAssignEmail,
  ICreateEmail,
  IResetPassword,
  ISendEmail,
  IWelcomeEmail,
} from '../mailing/interfaces';

@Injectable()
export class MessagingQueueProducer {
  constructor(
    @InjectQueue(QUEUE)
    private readonly messagingQueue: Queue,
  ) {}

  async queueResetTokenEmail(data: IResetPassword) {
    await this.addToQueue(JOBS.QUEUE_RESET_TOKEN_EMAIL, data, {
      removeOnComplete: true,
    });
  }

  async queueWelcomeEmail(data: IWelcomeEmail) {
    await this.addToQueue(JOBS.QUEUE_WELCOME_EMAIL, data, {
      removeOnComplete: true,
    });
  }

  async queueCreateStaffEmail(data: ISendEmail) {
    await this.addToQueue(JOBS.QUEUE_CREATE_STAFF_EMAIL, data, {
      removeOnComplete: true,
    });
  }

  async queueCreateComplaintEmail(data: ICreateEmail) {
    await this.addToQueue(JOBS.QUEUE_CREATE_COMPLAINT_EMAIL, data, {
      removeOnComplete: true,
    });
  }

  async queueAssignComplaintEmail(data: IAssignEmail) {
    await this.addToQueue(JOBS.QUEUE_ASSIGN_COMPLAINT_EMAIL, data, {
      removeOnComplete: true,
    });
  }

  private async addToQueue(jobName: JOBS, data: any, opts?: JobOptions) {
    return this.messagingQueue.add(jobName, data, opts);
  }
}
