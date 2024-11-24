import {
  Controller,
  Get,
  Request,
  Post,
  Body,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
  Put,
  Ip
} from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { Public } from './auth/constants';
import { UserRegisterParams } from './dto/register.validation';
import { User } from './dto/user.entity';
import { IPublicUser, IPrivateUser } from './dto/user.interface';
import { UserExtraInfo } from './dto/user-extra-info';
import { SelfOrAdmin } from './auth/constants';
@Controller('user')
export class UserController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @SelfOrAdmin()
  @Get('profile')
  async getProfile(@Request() req: { user_id: number }): Promise<IPrivateUser> {
    const user = await this.authService.getOneById({ id: req.user_id });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user.getAllData();
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @Get('public-profile')
  async getPublicProfile(@Request() req: { user_id: number }): Promise<IPublicUser> {
    const user = await this.authService.getOneById({ id: req.user_id });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user.getPublicData();
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('register')
  async register(
    @Body() body: UserRegisterParams,
    @Ip() ip: string,
  ): Promise<IPublicUser & { accessToken: string }> {
    const user = await this.authService.register(body, ip);
    const { accessToken } = await this.authService.getLoginAccessToken(user);
    return {
      ...user.getPublicData(),
      accessToken,
    };
  }

  @HttpCode(HttpStatus.OK)
  @SelfOrAdmin()
  @Put('update-name')
  async updateLastName(
    @Request() req: { user_id: number },
    @Body() body: { lastName: string },
  ): Promise<IPublicUser> {
    const user = await this.authService.updateLastName(req.user_id, body.lastName);
    return user.getPublicData();
  }

  @HttpCode(HttpStatus.OK)
  @SelfOrAdmin()
  @Put('update-profile')
  async updateProfile(
    @Request() req: { user_id: number },
    @Body() body: { extraInfo: UserExtraInfo },
  ): Promise<IPublicUser> {
    const user = await this.authService.updateExtraInfo(req.user_id, body.extraInfo);
    return user.getPublicData();
  }
}
