import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from './common/cache/cache.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig from './app.config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaService } from './common/prisma/prisma.service';
import { JwtStrategy } from './auth/strategy/jwt.strategy';
import { ComplaintModule } from './complaint/complaint.module';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';
import { DepartmentModule } from './department/department.module';
import { StaffModule } from './staff/staff.module';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module';
import { MailingModule } from './common/messaging/mailing/mailing.module';
import { BullModule } from '@nestjs/bull';
import { QUEUE } from './common/messaging/interfaces';
import { AdminModule } from './admin/admin.module';

@Global()
@Module({
  imports: [
    AuthModule,
    CacheModule,
    CloudinaryModule,
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig] }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        prefix: `${config.get('environment')}.${config.get('app.name')}`,
        redis: config.get('redis'),
      }),
    }),
    BullModule.registerQueue({ name: QUEUE }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get('jwt.secret'),
        signOptions: {
          expiresIn: config.get('jwt.expiresIn'),
        },
      }),
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ComplaintModule,
    UserModule,
    CategoryModule,
    DepartmentModule,
    StaffModule,
    MailingModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, JwtService, JwtStrategy],
  exports: [AuthModule, JwtService, BullModule],
})
export class AppModule {}
