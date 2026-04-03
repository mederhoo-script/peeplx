import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TrustScore, ScoreLevel } from './entities/trust-score.entity';
import { User } from '../users/entities/user.entity';
import { EscrowTransaction, TransactionStatus } from '../escrow/entities/escrow-transaction.entity';
import { Review } from './entities/review.entity';

interface TrustScoreCalculation {
  overallScore: number;
  transactionScore: number;
  valueScore: number;
  disputeScore: number;
  verificationScore: number;
  longevityScore: number;
  reviewScore: number;
  details: Record<string, any>;
}

@Injectable()
export class TrustScoreService {
  private readonly logger = new Logger(TrustScoreService.name);

  // Score weights (must sum to 100)
  private readonly WEIGHTS = {
    transactionScore: 25,
    valueScore: 20,
    disputeScore: 20,
    verificationScore: 15,
    longevityScore: 10,
    reviewScore: 10,
  };

  // Thresholds
  private readonly MIN_TRANSACTIONS_FOR_SCORE = 3;
  private readonly SCORE_DECAY_DAYS = 90;
  private readonly DISPUTE_PENALTY = 10;

  constructor(
    @InjectRepository(TrustScore)
    private trustScoreRepository: Repository<TrustScore>,
    @InjectRepository(EscrowTransaction)
    private escrowRepository: Repository<EscrowTransaction>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Initialize trust score for a new user
   */
  async initializeTrustScore(userId: string): Promise<TrustScore> {
    this.logger.log(`Initializing trust score for user: ${userId}`);

    const trustScore = this.trustScoreRepository.create({
      userId,
      overallScore: 0,
      scoreLevel: ScoreLevel.NEW_TRADER,
      totalTransactions: 0,
      successfulTransactions: 0,
      disputedTransactions: 0,
      cancelledTransactions: 0,
      totalTransactionValue: 0,
      buyerTransactions: 0,
      sellerTransactions: 0,
      totalReviews: 0,
      averageRating: 0,
      scoreHistory: [],
    });

    return this.trustScoreRepository.save(trustScore);
  }

  /**
   * Calculate trust score for a user
   */
  async calculateTrustScore(userId: string): Promise<TrustScore> {
    this.logger.log(`Calculating trust score for user: ${userId}`);

    let trustScore = await this.trustScoreRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!trustScore) {
      trustScore = await this.initializeTrustScore(userId);
    }

    // Get user data
    const user = trustScore.user;

    // Calculate component scores
    const transactionMetrics = await this.calculateTransactionMetrics(userId);
    const reviewMetrics = await this.calculateReviewMetrics(userId);

    const calculation: TrustScoreCalculation = {
      transactionScore: this.calculateTransactionScore(transactionMetrics),
      valueScore: this.calculateValueScore(transactionMetrics),
      disputeScore: this.calculateDisputeScore(transactionMetrics),
      verificationScore: this.calculateVerificationScore(user),
      longevityScore: this.calculateLongevityScore(user),
      reviewScore: this.calculateReviewScore(reviewMetrics),
      overallScore: 0,
      details: {
        transactionMetrics,
        reviewMetrics,
      },
    };

    // Calculate weighted overall score
    calculation.overallScore = Math.round(
      (calculation.transactionScore * this.WEIGHTS.transactionScore +
        calculation.valueScore * this.WEIGHTS.valueScore +
        calculation.disputeScore * this.WEIGHTS.disputeScore +
        calculation.verificationScore * this.WEIGHTS.verificationScore +
        calculation.longevityScore * this.WEIGHTS.longevityScore +
        calculation.reviewScore * this.WEIGHTS.reviewScore) /
        100,
    );

    // Ensure score is within bounds
    calculation.overallScore = Math.max(0, Math.min(100, calculation.overallScore));

    // Update trust score record
    const oldScore = trustScore.overallScore;
    const oldLevel = trustScore.scoreLevel;

    trustScore.overallScore = calculation.overallScore;
    trustScore.transactionScore = calculation.transactionScore;
    trustScore.valueScore = calculation.valueScore;
    trustScore.disputeScore = calculation.disputeScore;
    trustScore.verificationScore = calculation.verificationScore;
    trustScore.longevityScore = calculation.longevityScore;
    trustScore.reviewScore = calculation.reviewScore;

    // Update statistics
    trustScore.totalTransactions = transactionMetrics.total;
    trustScore.successfulTransactions = transactionMetrics.successful;
    trustScore.disputedTransactions = transactionMetrics.disputed;
    trustScore.cancelledTransactions = transactionMetrics.cancelled;
    trustScore.totalTransactionValue = transactionMetrics.totalValue;
    trustScore.buyerTransactions = transactionMetrics.asBuyer;
    trustScore.sellerTransactions = transactionMetrics.asSeller;
    trustScore.buyerSuccessRate = transactionMetrics.buyerSuccessRate;
    trustScore.sellerSuccessRate = transactionMetrics.sellerSuccessRate;
    trustScore.totalReviews = reviewMetrics.total;
    trustScore.averageRating = reviewMetrics.average;

    // Update score history
    trustScore.scoreHistory.push({
      date: new Date().toISOString(),
      score: calculation.overallScore,
      reason: 'Periodic recalculation',
    });

    // Keep only last 100 history entries
    if (trustScore.scoreHistory.length > 100) {
      trustScore.scoreHistory = trustScore.scoreHistory.slice(-100);
    }

    // Update highest/lowest scores
    if (calculation.overallScore > trustScore.highestScore) {
      trustScore.highestScore = calculation.overallScore;
    }
    if (trustScore.lowestScore === 0 || calculation.overallScore < trustScore.lowestScore) {
      trustScore.lowestScore = calculation.overallScore;
    }

    // Save updated trust score
    const saved = await this.trustScoreRepository.save(trustScore);

    // Emit event if score or level changed
    if (oldScore !== saved.overallScore || oldLevel !== saved.scoreLevel) {
      this.eventEmitter.emit('trust-score.changed', {
        userId,
        oldScore,
        newScore: saved.overallScore,
        oldLevel,
        newLevel: saved.scoreLevel,
      });
    }

    this.logger.log(
      `Trust score calculated for user ${userId}: ${saved.overallScore} (${saved.scoreLevel})`,
    );

    return saved;
  }

  /**
   * Calculate transaction metrics
   */
  private async calculateTransactionMetrics(userId: string): Promise<{
    total: number;
    successful: number;
    disputed: number;
    cancelled: number;
    totalValue: number;
    asBuyer: number;
    asSeller: number;
    buyerSuccessRate: number;
    sellerSuccessRate: number;
  }> {
    // Get all transactions where user is buyer or seller
    const [asBuyer, asSeller] = await Promise.all([
      this.escrowRepository.find({
        where: { buyerId: userId },
        select: ['status', 'amount'],
      }),
      this.escrowRepository.find({
        where: { sellerId: userId },
        select: ['status', 'amount'],
      }),
    ]);

    const allTransactions = [...asBuyer, ...asSeller];

    const successful = allTransactions.filter(
      (t) => t.status === TransactionStatus.COMPLETED,
    ).length;

    const disputed = allTransactions.filter(
      (t) => t.status === TransactionStatus.DISPUTED,
    ).length;

    const cancelled = allTransactions.filter(
      (t) => t.status === TransactionStatus.CANCELLED,
    ).length;

    const totalValue = allTransactions.reduce((sum, t) => sum + t.amount, 0);

    const buyerSuccessful = asBuyer.filter(
      (t) => t.status === TransactionStatus.COMPLETED,
    ).length;

    const sellerSuccessful = asSeller.filter(
      (t) => t.status === TransactionStatus.COMPLETED,
    ).length;

    return {
      total: allTransactions.length,
      successful,
      disputed,
      cancelled,
      totalValue,
      asBuyer: asBuyer.length,
      asSeller: asSeller.length,
      buyerSuccessRate: asBuyer.length > 0 ? (buyerSuccessful / asBuyer.length) * 100 : 0,
      sellerSuccessRate: asSeller.length > 0 ? (sellerSuccessful / asSeller.length) * 100 : 0,
    };
  }

  /**
   * Calculate review metrics
   */
  private async calculateReviewMetrics(userId: string): Promise<{
    total: number;
    average: number;
    distribution: Record<number, number>;
  }> {
    const reviews = await this.reviewRepository.find({
      where: { revieweeId: userId, isVisible: true },
      select: ['rating'],
    });

    if (reviews.length === 0) {
      return { total: 0, average: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    }

    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const average = sum / total;

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      distribution[r.rating]++;
    });

    return { total, average, distribution };
  }

  /**
   * Calculate transaction score (0-100)
   */
  private calculateTransactionScore(metrics: {
    total: number;
    successful: number;
  }): number {
    if (metrics.total < this.MIN_TRANSACTIONS_FOR_SCORE) {
      // Linear scale for first 3 transactions
      return Math.round((metrics.total / this.MIN_TRANSACTIONS_FOR_SCORE) * 30);
    }

    const successRate = metrics.total > 0 ? metrics.successful / metrics.total : 0;

    // Score based on transaction count and success rate
    let score = Math.min(100, metrics.total * 5); // 5 points per transaction, max 100
    score = score * successRate; // Adjust by success rate

    return Math.round(score);
  }

  /**
   * Calculate value score (0-100)
   */
  private calculateValueScore(metrics: { totalValue: number }): number {
    // Score based on total transaction value
    // ₦1,000,000 = 50 points, ₦10,000,000 = 100 points
    const valueInNaira = metrics.totalValue / 100;
    const score = Math.min(100, Math.log10(valueInNaira / 10000 + 1) * 25);

    return Math.round(score);
  }

  /**
   * Calculate dispute score (0-100) - inverse of dispute rate
   */
  private calculateDisputeScore(metrics: { total: number; disputed: number }): number {
    if (metrics.total === 0) return 50; // Neutral score for new users

    const disputeRate = metrics.disputed / metrics.total;
    const score = Math.max(0, 100 - disputeRate * 100 * 2); // 2x penalty for disputes

    return Math.round(score);
  }

  /**
   * Calculate verification score (0-100)
   */
  private calculateVerificationScore(user: User): number {
    let score = 0;

    // Email verification: 20 points
    if (user.isEmailVerified) score += 20;

    // Phone verification: 15 points
    if (user.phoneNumber) score += 15;

    // ID verification: 40 points
    if (user.idVerificationStatus === 'verified') score += 40;
    else if (user.idVerificationStatus === 'pending') score += 10;

    // Account age bonus: up to 25 points
    const accountAgeDays =
      (new Date().getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    score += Math.min(25, accountAgeDays / 12); // 1 point per 12 days, max 25

    return Math.round(score);
  }

  /**
   * Calculate longevity score (0-100)
   */
  private calculateLongevityScore(user: User): number {
    const accountAgeDays =
      (new Date().getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24);

    // Score based on account age
    // 30 days = 10 points, 180 days = 50 points, 365 days = 100 points
    let score = 0;
    if (accountAgeDays >= 365) {
      score = 100;
    } else if (accountAgeDays >= 180) {
      score = 50 + ((accountAgeDays - 180) / 185) * 50;
    } else if (accountAgeDays >= 30) {
      score = 10 + ((accountAgeDays - 30) / 150) * 40;
    } else {
      score = (accountAgeDays / 30) * 10;
    }

    return Math.round(score);
  }

  /**
   * Calculate review score (0-100)
   */
  private calculateReviewScore(metrics: {
    total: number;
    average: number;
  }): number {
    if (metrics.total === 0) return 30; // Neutral score for no reviews

    // Score based on average rating and number of reviews
    const ratingScore = (metrics.average / 5) * 70; // 70% from rating
    const volumeScore = Math.min(30, metrics.total * 3); // 30% from volume (max at 10 reviews)

    return Math.round(ratingScore + volumeScore);
  }

  /**
   * Get trust score by user ID
   */
  async getTrustScore(userId: string): Promise<TrustScore | null> {
    return this.trustScoreRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
  }

  /**
   * Get public trust profile
   */
  async getPublicProfile(username: string): Promise<{
    user: Partial<User>;
    trustScore: Partial<TrustScore>;
  } | null> {
    const trustScore = await this.trustScoreRepository.findOne({
      where: { publicProfileEnabled: true },
      relations: ['user'],
    });

    if (!trustScore || trustScore.user.username !== username) {
      return null;
    }

    // Increment profile views
    trustScore.profileViews++;
    await this.trustScoreRepository.save(trustScore);

    return {
      user: trustScore.user.publicProfile,
      trustScore: trustScore.publicProfile,
    };
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(limit: number = 100): Promise<TrustScore[]> {
    return this.trustScoreRepository.find({
      where: { publicProfileEnabled: true },
      order: { overallScore: 'DESC' },
      take: limit,
      relations: ['user'],
    });
  }

  /**
   * Flag user for suspicious activity
   */
  async flagUser(
    userId: string,
    reason: string,
    flags: number = 1,
  ): Promise<TrustScore> {
    const trustScore = await this.getTrustScore(userId);
    if (!trustScore) {
      throw new Error('Trust score not found');
    }

    trustScore.isFlagged = true;
    trustScore.flaggedReason = reason;
    trustScore.riskFlags += flags;

    // Apply penalty to score
    trustScore.overallScore = Math.max(0, trustScore.overallScore - flags * 5);

    return this.trustScoreRepository.save(trustScore);
  }

  /**
   * Recalculate all trust scores (for scheduled job)
   */
  async recalculateAllScores(): Promise<void> {
    this.logger.log('Starting batch trust score recalculation');

    const scores = await this.trustScoreRepository.find({
      select: ['userId'],
    });

    for (const score of scores) {
      try {
        await this.calculateTrustScore(score.userId);
      } catch (error) {
        this.logger.error(
          `Failed to calculate trust score for user ${score.userId}:`,
          error.message,
        );
      }
    }

    this.logger.log('Batch trust score recalculation completed');
  }
}
