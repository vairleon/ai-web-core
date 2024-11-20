import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Authority } from './authority.entity';
import { IPrivateUser, IPublicUser } from './user.interface';
import { UserExtraInfo } from './user-extra-info';

export enum UserRole {
  ADMIN = 'admin',
  TASK_SLAVE = 'task_slave',
  MEMBER = 'member',
  NORMAL = 'normal',
  ANONYMOUS = 'anonymous',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'pk_id' })
  id: number;

  @Index('IDX_EMAIL', { unique: true })
  @Column()
  email: string;

  @Index('IDX_USER_NAME', { unique: true })
  @Column()
  userName: string;

  @Index('IDX_PHONE', { unique: true })
  @Column({ nullable: true })
  phone: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  secretAuthPasswd: string;

  @CreateDateColumn()
  createTime: Date;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.ANONYMOUS,
  })
  role: UserRole;

  @OneToMany(() => Authority, (authority) => authority.owner, {
    eager: true,
    cascade: true,
  })
  authorities: Authority[];

  @Column({ type: 'int', default: 0 })
  credit: number;

  @Column({ type: 'json', nullable: true })
  extraInfo: UserExtraInfo;

  get authorityKeys(): string[] {
    if (!this.authorities) {
      return [];
    }
    return this.authorities.map((a) => a.featureKey);
  }

  getAllData(): IPrivateUser {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      userName: this.userName,
      phone: this.phone,
      role: this.role,
      authorityKeys: this.authorityKeys,
      credit: this.credit,
      extraInfo: this.extraInfo,
    };
  }

  getPublicData(): IPublicUser {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      extraInfo: this.extraInfo,
    };
  }
}
