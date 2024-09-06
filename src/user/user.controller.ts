import {
  Body,
  Controller,
  Get,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { ResponseMessage } from 'src/common/decorators/response.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AdminAuthGuard } from 'src/auth/guard/admin-auth.guard';

@ApiBearerAuth()
@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async getProfile(@GetUser() user: User) {
    return this.userService.getProfile(user);
  }

  @UseGuards(AdminAuthGuard)
  @Get()
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @ResponseMessage({ message: 'Profile Updated Successfully' })
  @UseGuards(JwtAuthGuard)
  @Patch('/profile/update')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateProfileDto })
  async updateProfile(
    @UploadedFile() profilePic: Express.Multer.File,
    @Body() dto: UpdateProfileDto,
    @GetUser() user: User,
  ) {
    return this.userService.updateProfile(profilePic, dto, user);
  }
}
