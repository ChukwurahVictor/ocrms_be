import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';

@Module({
  controllers: [UserController],
  providers: [UserService, CloudinaryService],
})
export class UserModule {}
