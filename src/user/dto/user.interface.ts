import { User } from './user.entity';
import { UserExtraInfo } from './user-extra-info';

export type IRegisterUser = Pick<
  User,
  'firstName' | 'lastName' | 'email' | 'userName'
> &
  Partial<Pick<User, 'phone' | 'extraInfo'>> & {
    password: string;
  };

export type IPrivateUser = Pick<
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


export type IPublicUser = Pick<User, | 'id' | 'firstName' | 'lastName'> & 
{
  extraInfo?: Pick<UserExtraInfo, | 'profileImage' | 'gender' | 'description'>
};