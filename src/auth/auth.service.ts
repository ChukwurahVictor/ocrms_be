import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AppUtilities } from 'src/common/utilities';
import { SignupDto } from './dto/signup.dto';
import { CacheService } from 'src/common/cache/cache.service';
import { RequestResetPasswordDto } from './dto/request-reset-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from '@prisma/client';
import { CacheKeysEnums } from 'src/common/cache/cache.enum';
import { MessagingQueueProducer } from 'src/common/messaging/queue/producer';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private messagingQueue: MessagingQueueProducer,
    private cacheService: CacheService,
  ) {}

  private async signToken(userId: string, email: string) {
    const payload = { email, userId: userId.toString() };
    const secret = this.config.get('jwt.secret');
    const expiresIn = this.config.get('jwt.expiresIn');

    return await this.jwt.signAsync(payload, { secret, expiresIn });
  }

  async signup({ email, password, firstName, ...rest }: SignupDto) {
    const hash = await AppUtilities.hashPassword(password);

    try {
      const user = await this.prisma.user.create({
        data: {
          ...rest,
          firstName,
          email,
          password: hash,
        },
      });

      await this.messagingQueue.queueWelcomeEmail({
        firstName,
        email,
      });

      return AppUtilities.removeSensitiveData(user, 'password');
    } catch (err) {
      if (err.code === 'P2002') {
        throw new ForbiddenException('Email address already exists');
      }
      console.log(err);
      throw err;
    }
  }

  async login({ email, password }: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) throw new UnauthorizedException('Incorrect Credentials');

    const verifyPass = await AppUtilities.comparePasswords(
      password,
      user.password,
    );

    if (!verifyPass) throw new UnauthorizedException('Incorrect Credentials');

    const token = await this.signToken(user.id, user.email);

    const [, , sessionId] = token.split('.');

    const payload = {
      type: 'USER',
      userId: user.id.toString(),
      email: email.toLowerCase(),
    };

    await this.cacheService.set(
      `${CacheKeysEnums.TOKENS}:${user.id}:${sessionId}`,
      payload,
      this.config.get('jwt.expiresIn'),
    );
    return {
      token,
      user: AppUtilities.removeSensitiveData(user, 'password'),
    };
  }

  async logout() {
    return 'Logout Endpoint';
  }

  async changePassword(
    { oldPassword, newPassword }: ChangePasswordDto,
    user: User,
  ) {
    console.log('User =>', user);
    const userExists = await this.prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!userExists) throw new UnauthorizedException('Incorrect Credentials');

    const verifyPass = await AppUtilities.comparePasswords(
      oldPassword,
      userExists.password,
    );

    if (!verifyPass) throw new UnauthorizedException('Incorrect Old Password');

    const hash = await AppUtilities.hashPassword(newPassword);

    const userUpdated = await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hash },
    });

    return AppUtilities.removeSensitiveData(userUpdated, 'password');
  }

  async requestResetPassword({ email }: RequestResetPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) throw new UnauthorizedException('Incorrect Credentials');

    const generatedToken = AppUtilities.generateRandomNumber();

    await this.cacheService.set(generatedToken, user);

    await this.messagingQueue.queueResetTokenEmail({
      email,
      firstName: user.firstName,
      link: generatedToken,
    });

    return {
      message: 'Password reset link sent to your email',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const userInfo = await this.cacheService.get(dto.token);

    if (!userInfo)
      throw new UnauthorizedException('Invalid Token or Token Expired');

    const user = await this.prisma.user.findUnique({
      where: { email: userInfo.email },
    });

    if (!user) throw new UnauthorizedException('Incorrect Credentials');

    const hash = await AppUtilities.hashPassword(dto.newPassword);

    const verifyPass = await AppUtilities.comparePasswords(
      dto.newPassword,
      user.password,
    );

    if (verifyPass) throw new UnauthorizedException('Cannot use old password');

    const updateUserPassword = await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hash },
    });

    await this.cacheService.remove(dto.token);

    return AppUtilities.removeSensitiveData(updateUserPassword, 'password');
  }
}
