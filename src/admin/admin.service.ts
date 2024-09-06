import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { AppUtilities } from 'src/common/utilities';
import { UserRole } from 'src/common/interfaces';
import { MessagingQueueProducer } from 'src/common/messaging/queue/producer';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private messagingQueue: MessagingQueueProducer,
  ) {}

  async createAdmin({ email, firstName, ...rest }: CreateAdminDto) {
    const userExist = await this.prisma.user.findUnique({
      where: { email: email },
    });

    if (userExist) {
      throw new ForbiddenException('Email already exist.');
    }

    const password = await AppUtilities.generatePassword();
    const hash = await AppUtilities.hashPassword(password);

    try {
      const admin = await this.prisma.user.create({
        data: {
          email,
          firstName,
          userRole: UserRole.ADMIN,
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
      return AppUtilities.removeSensitiveData(admin, 'password');
    } catch (error) {
      throw error;
    }
  }

  async fetchAllAdmins() {
    const admins = await this.prisma.user.findMany({
      where: {
        userRole: UserRole.ADMIN,
      },
    });
    return AppUtilities.removeSensitiveData(admins, 'password');
  }

  async fetchAdmin(id: string) {
    const admin = await this.prisma.user.findUnique({
      where: { id },
    });

    return AppUtilities.removeSensitiveData(admin, 'password');
  }
}
