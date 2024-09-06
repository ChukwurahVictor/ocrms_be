import { User } from '@prisma/client';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CloudinaryService } from './../common/cloudinary/cloudinary.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AppUtilities } from 'src/common/utilities';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async getProfile(user: User) {
    const getUser = await this.prisma.user.findFirst({
      where: { id: user.id },
    });
    if (!getUser) {
      throw new BadRequestException('User not found.');
    }
    return AppUtilities.removeSensitiveData(getUser, 'password');
  }

  async getAllUsers() {
    return await this.prisma.user.findMany();
  }

  async updateProfile(
    profilePic: Express.Multer.File,
    { image, ...others }: UpdateProfileDto,
    user: User,
  ) {
    const findUser = await this.prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!findUser) {
      throw new BadRequestException('User not found.');
    }

    const uploadProfilePic: any = profilePic
      ? await this.cloudinaryService
          .uploadProfilePic(profilePic, user.id)
          .catch((e) => {
            console.error(e);
            // throw new BadRequestException(
            //   'Invalid file type, must be an image.',
            // );
          })
      : null;
    const profilePicture = uploadProfilePic?.secure_url || '';

    const updateUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        ...others,
        profileImgUrl: profilePicture,
        updatedBy: user.id,
      },
    });

    return AppUtilities.removeSensitiveData(updateUser, 'password');
  }
}
