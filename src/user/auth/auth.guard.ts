import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { IS_ADMIN_KEY, IS_PUBLIC_KEY, jwtConstants } from './constants';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth.service';
import { UserRole } from '../dto/user.entity';
import { AuthorizedRequest } from './interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthorizedRequest>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      const user = await this.authService.getOneById({ id: payload.id });
      if (!user) {
        return false;
      }
      request['user_id'] = payload.id;
      request['user'] = user;

      const isAdmin = this.reflector.getAllAndOverride<boolean>(IS_ADMIN_KEY, [
        context.getClass(),
        context.getHandler(),
      ]);
      if (isAdmin && user.role !== UserRole.ADMIN) {
        return false;
      }

      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
