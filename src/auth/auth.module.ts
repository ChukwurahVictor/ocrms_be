import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailingService } from 'src/common/messaging/mailing/mailing.service';
import { CacheModule } from 'src/common/cache/cache.module';
import { MessagingQueueConsumer } from 'src/common/messaging/queue/consumer';
import { MessagingQueueProducer } from 'src/common/messaging/queue/producer';
import { BullModule } from '@nestjs/bull';
import { QUEUE } from 'src/common/messaging/interfaces';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    MailingService,
    MessagingQueueConsumer,
    MessagingQueueProducer,
  ],
  imports: [
    PrismaModule,
    PassportModule,
    CacheModule,
    BullModule.registerQueue({ name: QUEUE }),
    JwtModule.registerAsync({
      imports: [ConfigModule.forRoot()],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: { expiresIn: configService.get<string>('jwt.expiresIn') },
      }),
    }),
  ],
})
export class AuthModule {}
