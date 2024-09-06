import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import {
  IAssignEmail,
  ICreateEmail,
  IResetPassword,
  ISendEmail,
  IWelcomeEmail,
  Template,
} from './interfaces';
import { User } from '@prisma/client';

@Injectable()
export class MailingService {
  constructor(private mailerService: MailerService) {}

  async sendTestEmail(email: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'This is just a test email from SecretSanta',
      template: 'testEmail',
      context: { email },
    });

    return { message: 'Test email successfully sent' };
  }

  async sendResetToken(email, firstName, token: any) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset Requested',
      template: Template.passwordResetEmail,
      context: { email: email, firstName: firstName, link: token },
    });
    console.log('Password reset email sent successfully');
  }

  async sendWelcomeEmail({
    email,
    subject = 'Welcome Onboard to Complaint Management System',
    template = Template.welcomeUserEmail,
    firstName,
  }: IWelcomeEmail) {
    await this.mailerService.sendMail({
      to: email,
      subject,
      template,
      context: { email, firstName },
    });
  }

  async sendCreateStaffEmail({
    email,
    subject = 'Welcome Onboard to Complaint Management System',
    template = Template.createStaffEmail,
    firstName,
    password,
  }: ISendEmail) {
    await this.mailerService.sendMail({
      to: email,
      subject,
      template,
      context: { email, firstName, password },
    });
  }

  async sendAssignComplaintEmail({
    referenceNo,
    department,
    firstName,
    email,
    subject = 'Complaint Assignment',
    template = Template.complaintAssignmentEmail,
  }: IAssignEmail) {
    await this.mailerService.sendMail({
      to: email,
      subject,
      template,
      context: { firstName, referenceNo, department },
    });
  }

  async sendCreateComplaintEmail({
    referenceNo,
    firstName,
    email,
    subject = 'Complaint Registered!',
    template = Template.createComplaintEmail,
  }: ICreateEmail) {
    await this.mailerService.sendMail({
      to: email,
      subject,
      template,
      context: { firstName, referenceNo },
    });
  }
}
