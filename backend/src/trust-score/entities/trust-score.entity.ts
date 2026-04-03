import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ScoreLevel {
  NEW_TRADER = 'new_trader',
  VERIFIED_TRADER = 'verified_trader',
  TRUSTED_TRADER = 'trusted_trader',
  ELITE_TRADER = 'elite_trader',
}

@Entity('trust_scores')
@Index(['overallScore'])
@Index(['scoreLevel'])
@Index(['isFlagged'])
export class TrustScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  userId: string;

  @OneToOne(() => User, (user) => user.trustScore)
  @JoinColumn({ name: 'userId' })
  user: User;

  // Core Score (0-100)
  @Column({ type: 'int', default: 0 })
  overallScore: number;

  @Column({
    type: 'enum',
    enum: ScoreLevel,
    default: ScoreLevel.NEW_TRADER,
  })
  scoreLevel: ScoreLevel;

  // Component Scores (each 0-100)
  @Column({ type: 'int', default: 0 })
  transactionScore: number; // Based on completed transactions

  @Column({ type: 'int', default: 0 })
  valueScore: number; // Based on total transaction value

  @Column({ type: 'int', default: 0 })
  disputeScore: number; // Based on dispute rate (inverse)

  @Column({ type: 'int', default: 0 })
  verificationScore: number; // Based on ID verification

  @Column({ type: 'int', default: 0 })
  longevityScore: number; // Based on account age

  @Column({ type: 'int', default: 0 })
  reviewScore: number; // Based on community reviews

  // Transaction Statistics
  @Column({ type: 'int', default: 0 })
  totalTransactions: number;

  @Column({ type: 'bigint', default: 0 })
  totalTransactionValue: number;

  @Column({ type: 'int', default: 0 })
  successfulTransactions: number;

  @Column({ type: 'int', default: 0 })
  disputedTransactions: number;

  @Column({ type: 'int', default: 0 })
  cancelledTransactions: number;

  // As Buyer
  @Column({ type: 'int', default: 0 })
  buyerTransactions: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  buyerSuccessRate: number;

  // As Seller
  @Column({ type: 'int', default: 0 })
  sellerTransactions: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  sellerSuccessRate: number;

  // Reviews
  @Column({ type: 'int', default: 0 })
  totalReviews: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  // Fraud Detection
  @Column({ type: 'int', default: 0 })
  riskFlags: number;

  @Column({ type: 'boolean', default: false })
  isFlagged: boolean;

  @Column({ type: 'text', nullable: true })
  flaggedReason: string;

  // Public Profile
  @Column({ type: 'boolean', default: true })
  publicProfileEnabled: boolean;

  @Column({ type: 'int', default: 0 })
  profileViews: number;

  // Score History
  @Column({ type: 'int', default: 0 })
  highestScore: number;

  @Column({ type: 'int', default: 0 })
  lowestScore: number;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  scoreHistory: Array<{
    date: string;
    score: number;
    reason: string;
  }>;

  // Timestamps
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  calculatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual fields
  get formattedTotalValue(): string {
    return `₦${(this.totalTransactionValue / 100).toLocaleString()}`;
  }

  get disputeRate(): number {
    if (this.totalTransactions === 0) return 0;
    return (this.disputedTransactions / this.totalTransactions) * 100;
  }

  get successRate(): number {
    if (this.totalTransactions === 0) return 0;
    return (this.successfulTransactions / this.totalTransactions) * 100;
  }

  get isTrusted(): boolean {
    return this.overallScore >= 60;
  }

  get isElite(): boolean {
    return this.overallScore >= 85;
  }

  get badge(): string {
    const badges = {
      [ScoreLevel.NEW_TRADER]: '🌱 New Trader',
      [ScoreLevel.VERIFIED_TRADER]: '✅ Verified Trader',
      [ScoreLevel.TRUSTED_TRADER]: '🌟 Trusted Trader',
      [ScoreLevel.ELITE_TRADER]: '👑 Elite Trader',
    };
    return badges[this.scoreLevel];
  }

  get badgeColor(): string {
    const colors = {
      [ScoreLevel.NEW_TRADER]: 'gray',
      [ScoreLevel.VERIFIED_TRADER]: 'blue',
      [ScoreLevel.TRUSTED_TRADER]: 'green',
      [ScoreLevel.ELITE_TRADER]: 'gold',
    };
    return colors[this.scoreLevel];
  }

  get publicUrl(): string {
    if (!this.publicProfileEnabled || !this.user?.username) return null;
    return `/trader/${this.user.username}`;
  }

  get scoreBreakdown(): Record<string, { score: number; weight: number }> {
    return {
      transactionScore: { score: this.transactionScore, weight: 25 },
      valueScore: { score: this.valueScore, weight: 20 },
      disputeScore: { score: this.disputeScore, weight: 20 },
      verificationScore: { score: this.verificationScore, weight: 15 },
      longevityScore: { score: this.longevityScore, weight: 10 },
      reviewScore: { score: this.reviewScore, weight: 10 },
    };
  }

  get nextLevel(): { level: ScoreLevel; scoreNeeded: number } | null {
    const levels = [
      { level: ScoreLevel.VERIFIED_TRADER, minScore: 30 },
      { level: ScoreLevel.TRUSTED_TRADER, minScore: 60 },
      { level: ScoreLevel.ELITE_TRADER, minScore: 85 },
    ];

    for (const level of levels) {
      if (this.overallScore < level.minScore) {
        return {
          level: level.level,
          scoreNeeded: level.minScore - this.overallScore,
        };
      }
    }

    return null;
  }

  get publicProfile(): Partial<TrustScore> {
    const {
      overallScore,
      scoreLevel,
      totalTransactions,
      totalTransactionValue,
      successfulTransactions,
      buyerTransactions,
      buyerSuccessRate,
      sellerTransactions,
      sellerSuccessRate,
      totalReviews,
      averageRating,
      createdAt,
    } = this;

    return {
      overallScore,
      scoreLevel,
      totalTransactions,
      totalTransactionValue,
      successfulTransactions,
      buyerTransactions,
      buyerSuccessRate,
      sellerTransactions,
      sellerSuccessRate,
      totalReviews,
      averageRating,
      createdAt,
    };
  }
}
