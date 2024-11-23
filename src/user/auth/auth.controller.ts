import { Body, Controller, HttpCode, HttpStatus, Post, Request, UnauthorizedException } from '@nestjs/common';
import { LoginParams } from '../dto/login.validation';
import { AuthService } from './auth.service';
import { Public } from './constants';
import { AuthorizedRequest } from './interface';
import { UserRole } from '../dto/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  logIn(@Body() logInDto: LoginParams) {
    return this.authService.logIn(logInDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  async refreshToken(@Request() req: AuthorizedRequest) {
    if (req.user.role !== UserRole.TASK_SLAVE) {
      throw new UnauthorizedException('Only task slaves can refresh tokens');
    }
    return this.authService.getLoginAccessToken(req.user);
  }
}
