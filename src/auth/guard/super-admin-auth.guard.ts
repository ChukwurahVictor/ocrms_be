import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from 'src/common/interfaces';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class SuperAdminAuthGuard extends AuthGuard('jwt') {
  constructor(private prisma: PrismaService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const canActivate = await super.canActivate(context);

    if (!canActivate) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // if (user.userRole !== UserRole.SUPER_ADMIN) {
    if (user.userRole !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'User cannot access this resource. You are not a Super Admin',
      );
    }

    return true;
  }
}
