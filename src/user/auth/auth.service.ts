import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../dto/user.entity';
import { IRegisterUser } from '../dto/user.interface';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Authority } from '../dto/authority.entity';
import * as emailValidator from 'email-validator';
import { LoginParams } from '../dto/login.validation';
import { UserExtraInfo } from '../dto/user-extra-info';
@Injectable()
export class AuthService {
  private readonly registrationAttempts = new Map<string, number>();
  private readonly MAX_REGISTRATIONS_PER_IP = 10;
  private readonly REGISTRATION_WINDOW = 24 * 60 * 60 * 1000; // 24 hours

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Authority)
    private authorityRepository: Repository<Authority>,
    private jwtService: JwtService,
  ) {
    if (!process.env.SUPER_USER_INIT_PASSWORD) {
      throw new Error('SUPER_USER_INIT_PASSWORD environment variable must be set');
    }
    
    this.userRepository.count().then(async (count) => {
      Logger.debug(`currently ${count} users are registered in the service`);
      if (!count) {
        Logger.log(`no users in the system, creating the superuser`);
        const user = new User();
        user.email = process.env.SUPER_USER_INIT_MAIL || `admin@outlook.com`;
        user.userName = process.env.SUPER_USER_INIT_NAME || 'admin';
        user.firstName = 'admin';
        user.lastName = 'admin';
        user.role = UserRole.ADMIN;
        user.secretAuthPasswd = await this.getSecretAuthByPassword(
          process.env.SUPER_USER_INIT_PASSWORD
        );
        this.userRepository.save(user);
      }
    });
  }

  private async getSecretAuthByPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  private async checkSecretAuthByPassword(
    password: string,
    secretAuth: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, secretAuth);
  }

  async updateUserRole(id: number, role: UserRole) {
    const user = await this.getOneById({ id });
    if (!user) {
      throw new BadRequestException(`the user id [${id}] is invalid`);
    }
    user.role = role;
    this.userRepository.save(user);
    return user;
  }

  async getAllUsers() {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .where('user.isActive = true')
      .limit(1000)
      .getMany();
    return users;
  }

  private validatePasswordStrength(password: string): boolean {
    if (password.length < 8) return false;
    
    let strengthCount = 0;
    if (/[A-Z]/.test(password)) strengthCount++;
    if (/[a-z]/.test(password)) strengthCount++;
    if (/[0-9]/.test(password)) strengthCount++;
    if (/[^A-Za-z0-9]/.test(password)) strengthCount++;
    
    return strengthCount >= 2;
  }

  async register(params: IRegisterUser, ip: string): Promise<User> {
    // Check IP-based registration limit
    const attempts = this.registrationAttempts.get(ip) || 0;
    if (attempts >= this.MAX_REGISTRATIONS_PER_IP) {
      throw new BadRequestException('Too many registration attempts from this IP');
    }

    // Update registration attempts
    this.registrationAttempts.set(ip, attempts + 1);
    setTimeout(() => {
      const currentAttempts = this.registrationAttempts.get(ip);
      if (currentAttempts) {
        this.registrationAttempts.set(ip, currentAttempts - 1);
      }
    }, this.REGISTRATION_WINDOW);

    if (!params.email) {
      throw new BadRequestException('the email should not be empty');
    }
    if (!emailValidator.validate(params.email)) {
      throw new BadRequestException('the email is not a valid email');
    }

    if (!params.userName) {
      throw new BadRequestException('the userName should not be empty');
    }

    const existUserByEmail = await this.getOneByEmail({ email: params.email });

    if (existUserByEmail) {
      throw new BadRequestException('the email is already registered');
    }

    const existUserByUserName = await this.getOneByUserName({ userName: params.userName });
    if (existUserByUserName) {
      throw new BadRequestException('the userName is already used');
    }

    if (!this.validatePasswordStrength(params.password)) {
      throw new BadRequestException('Password must be at least 8 characters and contain at least 2 of the following: uppercase, lowercase, numbers, special characters');
    }

    const user = new User();
    user.email = params.email;
    user.secretAuthPasswd = await this.getSecretAuthByPassword(params.password);
    user.userName = params.userName;
    user.lastName = params.lastName;
    user.role = UserRole.NORMAL;
    if (params.firstName) {
      user.firstName = params.firstName;
    }
    if (params.phone) {
      user.phone = params.phone;
    }

    const savedUser = await this.userRepository.save(user);
    // default features
    const authForStableDiffusion = new Authority();
    authForStableDiffusion.featureKey = 'sd';
    authForStableDiffusion.owner = user;
    this.authorityRepository.save(authForStableDiffusion);
    return savedUser;
  }

  async getOneById({ id }: { id: number }) {
    return this.userRepository.findOneBy({
      id,
    });
  }

  async getOneByUserName({ userName }: { userName: string }) {
    return this.userRepository.findOneBy({
      userName,
    });
  }

  async getOneByPhoneNumber({ phone }: { phone: string }) {
    return this.userRepository.findOneBy({
      phone,
    });
  }

  async getOneByEmail({ email }: { email: string }) {
    return this.userRepository.findOneBy({
      email,
    });
  }

  async getLoginAccessToken(user: User): Promise<{ accessToken: string }> {
    const payload = {
      username: user.userName,
      email: user.email,
      id: user.id,
    };

    // Logger.debug(`payload is ${JSON.stringify(payload)}`);
    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  async logIn(logInDto: LoginParams) {
    let user: User | null;
    const { email, userName, password, phone } = logInDto;
    if (email) {
      user = await this.getOneByEmail({ email });
    } else if (userName) {
      user = await this.getOneByUserName({ userName });
    } else if (phone) {
      user = await this.getOneByPhoneNumber({ phone });
    } else {
      throw new BadRequestException(
        'params should have either email or userName',
      );
    }
    if (!user) {
      throw new UnauthorizedException();
    }
    // Logger.debug(`user founded: ${JSON.stringify(user)}`);
    const passwordVerified = await this.checkSecretAuthByPassword(
      password,
      user.secretAuthPasswd,
    );
    if (!passwordVerified) {
      throw new UnauthorizedException();
    }
    // logged in.
    return this.getLoginAccessToken(user);
  }

  async updateLastName(userId: number, lastName: string): Promise<User> {
    const user = await this.getOneById({ id: userId });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    user.lastName = lastName;
    return this.userRepository.save(user);
  }

  async updateExtraInfo(userId: number, extraInfo: UserExtraInfo): Promise<User> {
    const user = await this.getOneById({ id: userId });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    user.extraInfo = {
      ...user.extraInfo,
      ...extraInfo,
    };
    return this.userRepository.save(user);
  }
}
