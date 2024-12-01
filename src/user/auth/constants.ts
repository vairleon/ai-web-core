import { SetMetadata } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();

export const jwtConstants = {
  secret: process.env.JWT_SECRET
};

export const passwdSalt = process.env.BCRYPT_SALT;

// Throw error if environment variables are not set
if (!process.env.JWT_SECRET || !process.env.BCRYPT_SALT) {
  throw new Error('JWT_SECRET and BCRYPT_SALT environment variables must be set');
}

export const IS_PUBLIC_KEY = 'isPublic';
export const IS_ADMIN_KEY = 'isAdmin';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
export const Admin = () => SetMetadata(IS_ADMIN_KEY, true);
