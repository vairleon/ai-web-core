import { IRegisterUser } from './user.interface';
import {
  IsEmail,
  IsNotEmpty,
  IsStrongPassword,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserExtraInfo } from './user-extra-info';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class UserRegisterParams implements IRegisterUser {
  @ApiProperty()
  firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsNotEmpty()
  userName: string;

  @ApiProperty()
  @ValidateIf((o) => o.email)
  @IsEmail()
  email: string;

  @ApiProperty()
  phone?: string;

  @ApiProperty({
    description: 'Password must be at least 8 characters and contain at least 2 of the following: uppercase, lowercase, numbers, special characters'
  })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 0,
    minUppercase: 0,
    minNumbers: 0,
    minSymbols: 0
  }, {
    message: 'Password must be at least 8 characters and contain at least 2 of the following: uppercase, lowercase, numbers, special characters'
  })
  password: string;

  @ApiProperty()
  validateCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => UserExtraInfo)
  extraInfo?: UserExtraInfo;
}
