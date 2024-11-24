import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './dto/user.entity';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './auth/constants';
import { UserController } from './user.controller';
import { Authority } from './dto/authority.entity';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { ThrottlerModule } from '@nestjs/throttler';
import { CustomThrottlerGuard } from './guards/rate-limit.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Authority]),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '24h' },
    }),
    // ThrottlerModule.forRoot([{
    //   ttl: 60000, // 1 minute
    //   limit: 10, // 10 requests per minute for regular endpoints
    // }]),
  ],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: CustomThrottlerGuard,
    // }
  ],
  controllers: [AuthController, UserController],
  exports: [AuthService],
})
export class UserModule {}
