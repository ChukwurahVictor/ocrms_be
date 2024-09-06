import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { AppUtilities } from 'src/common/utilities';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { UserRole } from 'src/common/interfaces';
import { MailingService } from 'src/common/messaging/mailing/mailing.service';
import { ResendWecomeEmailDto } from './dto/resend-welcome-mail.dto';
import { MessagingQueueProducer } from 'src/common/messaging/queue/producer';

@Injectable()
export class StaffService {
  constructor(
    private prisma: PrismaService,
    private mailingService: MailingService,
    private messagingQueue: MessagingQueueProducer,
  ) {}

  async createStaff({
    email,
    firstName,
    departmentId,
    ...rest
  }: CreateStaffDto) {
    const staffExist = await this.prisma.user.findUnique({
      where: { email: email },
    });

    if (staffExist) {
      throw new ForbiddenException('Email already exist.');
    }

    const departmentExist = await this.prisma.department.findFirst({
      where: { id: departmentId },
    });

    if (!departmentExist) {
      throw new ForbiddenException('Invalid Department.');
    }

    const password = await AppUtilities.generatePassword();
    const hash = await AppUtilities.hashPassword(password);

    try {
      const staff = await this.prisma.user.create({
        data: {
          email,
          firstName,
          userRole: UserRole.STAFF,
          departmentId,
          password: hash,
          ...rest,
        },
      });

      // send mail
      await this.messagingQueue.queueCreateStaffEmail({
        firstName,
        email,
        password,
      });

      return AppUtilities.removeSensitiveData(staff, 'password');
    } catch (error) {
      throw error;
    }
  }

  async fetchAllStaff() {
    const staff = await this.prisma.user.findMany({
      where: { userRole: 'Staff' },
      include: { department: true },
    });

    return AppUtilities.removeSensitiveData(staff, 'password');
  }

  async fetchStaff(id: string) {
    const staff = await this.prisma.user.findFirst({
      where: { id },
      include: { department: true },
    });
    if (!staff) {
      throw new BadRequestException('User not found.');
    }
    return AppUtilities.removeSensitiveData(staff, 'password');
  }

  async updateStaff(id: string, dto: UpdateStaffDto) {
    const staff = await this.prisma.user.findUnique({
      where: {
        id,
        userRole: UserRole.STAFF,
      },
    });

    if (!staff) {
      throw new BadRequestException('Staff not found.');
    }

    const updatedUSer = await this.prisma.user.update({
      where: { id, userRole: UserRole.STAFF },
      data: dto,
    });

    return AppUtilities.removeSensitiveData(updatedUSer, 'password');
  }

  async resendWelcomeEmail(dto: ResendWecomeEmailDto) {
    const staff = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!staff) {
      throw new BadRequestException('Staff not found.');
    }

    const password = await AppUtilities.generatePassword();
    const hash = await AppUtilities.hashPassword(password);

    try {
      const updatedStaff = await this.prisma.user.update({
        where: { id: staff.id },
        data: {
          password: hash,
        },
      });

      // send mail
      await this.messagingQueue.queueCreateStaffEmail({
        firstName: staff.firstName,
        email: staff.email,
        password,
      });

      return AppUtilities.removeSensitiveData(updatedStaff, 'password');
    } catch (error) {
      throw error;
    }
  }
}
