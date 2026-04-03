import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { TrustScore } from '../../trust-score/entities/trust-score.entity';
import { Wallet } from '../../wallet/entities/wallet.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
}

export enum VerificationStatus {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  @Exclude()
  passwordHash: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  username: string;

  // Identity Verification
  @Column({ type: 'varchar', length: 11, nullable: true })
  @Exclude()
  bvn: string;

  @Column({ type: 'varchar', length: 11, nullable: true })
  @Exclude()
  nin: string;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.UNVERIFIED,
  })
  idVerificationStatus: VerificationStatus;

  @Column({ type: 'timestamp', nullable: true })
  idVerifiedAt: Date;

  // Profile
  @Column({ type: 'text', nullable: true })
  avatarUrl: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location: string;

  // Account Status
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  emailVerifiedAt: Date;

  // Security
  @Column({ type: 'boolean', default: false })
  twoFactorEnabled: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Exclude()
  twoFactorSecret: string;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({ type: 'int', default: 0 })
  @Exclude()
  loginAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  @Exclude()
  lockedUntil: Date;

  // Relations
  @OneToOne(() => TrustScore, (trustScore) => trustScore.user, {
    cascade: true,
  })
  trustScore: TrustScore;

  @OneToOne(() => Wallet, (wallet) => wallet.user, {
    cascade: true,
  })
  @JoinColumn()
  wallet: Wallet;

  // Metadata
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  @Exclude()
  deletedAt: Date;

  // Virtual fields
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get isVerified(): boolean {
    return this.idVerificationStatus === VerificationStatus.VERIFIED;
  }

  get isLocked(): boolean {
    return this.lockedUntil && this.lockedUntil > new Date();
  }

  get publicProfile(): Partial<User> {
    const {
      id,
      firstName,
      lastName,
      username,
      avatarUrl,
      bio,
      location,
      idVerificationStatus,
      createdAt,
      trustScore,
    } = this;
    return {
      id,
      firstName,
      lastName,
      username,
      avatarUrl,
      bio,
      location,
      idVerificationStatus,
      createdAt,
      trustScore,
    };
  }
}
