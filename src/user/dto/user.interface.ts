import { User } from './user.entity';
import { UserExtraInfo } from './user-extra-info';

export type IRegisterUser = Pick<
  User,
  'firstName' | 'lastName' | 'email' | 'userName'
> &
  Partial<Pick<User, 'phone' | 'extraInfo'>> & {
    password: string;
  };

export type IPublicUser = Pick<
  User,
  | 'id'
  | 'email'
  | 'firstName'
  | 'lastName'
  | 'phone'
  | 'role'
  | 'userName'
  | 'authorityKeys'
  | 'credit'
> & {
  extraInfo?: UserExtraInfo;
};
