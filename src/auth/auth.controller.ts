import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from 'src/common/decorators/response.decorator';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from '@prisma/client';
import { RequestResetPasswordDto } from './dto/request-reset-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guard/jwt.guard';

@ApiBearerAuth()
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @ApiOperation({ summary: 'Login to your account.' })
  @ResponseMessage({ message: 'User logged in successfully.' })
  async login(@Body() login: LoginDto) {
    return this.authService.login(login);
  }

  @Post('/signup')
  @ApiOperation({ summary: 'Create an account.' })
  @ResponseMessage({ message: 'Account created successfully.' })
  async signup(@Body() signup: SignupDto) {
    return this.authService.signup(signup);
  }

  @Post('/change-password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Change password.' })
  @ResponseMessage({ message: 'Password changed successfully.' })
  async changePassword(@Body() body: ChangePasswordDto, @GetUser() user: User) {
    return this.authService.changePassword(body, user);
  }

  @Post('/request-reset-password')
  @ApiOperation({ summary: 'Request password reset.' })
  @ResponseMessage({ message: 'Password reset link sent to your email.' })
  async requestResetPassword(@Body() body: RequestResetPasswordDto) {
    return this.authService.requestResetPassword(body);
  }

  @Post('/reset-password')
  @ApiOperation({ summary: 'Reset Password' })
  @ResponseMessage({ message: 'Password reset successful.' })
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }
}
