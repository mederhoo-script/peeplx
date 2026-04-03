import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  EscrowTransaction,
  TransactionStatus,
  TransactionType,
} from './entities/escrow-transaction.entity';
import { EscrowEvent } from './entities/escrow-event.entity';
import { CreateEscrowDto } from './dto/create-escrow.dto';
import { WalletService } from '../wallet/wallet.service';
import { NotificationsService } from '../notifications/notifications.service';
import { TrustScoreService } from '../trust-score/trust-score.service';

@Injectable()
export class EscrowService {
  private readonly logger = new Logger(EscrowService.name);

  constructor(
    @InjectRepository(EscrowTransaction)
    private escrowRepository: Repository<EscrowTransaction>,
    @InjectRepository(EscrowEvent)
    private eventRepository: Repository<EscrowEvent>,
    private configService: ConfigService,
    private walletService: WalletService,
    private notificationsService: NotificationsService,
    private trustScoreService: TrustScoreService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new escrow transaction
   */
  async createEscrow(
    userId: string,
    createEscrowDto: CreateEscrowDto,
  ): Promise<EscrowTransaction> {
    this.logger.log(`Creating escrow transaction by user: ${userId}`);

    const { buyerId, sellerId, amount, title, description, type } = createEscrowDto;

    // Validate parties
    if (buyerId === sellerId) {
      throw new BadRequestException('Buyer and seller cannot be the same');
    }

    // Calculate fees
    const feeConfig = this.configService.get('escrow');
    const feePercentage = feeConfig.feePercentage || 2.5;
    const minFee = feeConfig.minFee || 500;
    const maxFee = feeConfig.maxFee || 500000;

    let feeAmount = Math.round(amount * (feePercentage / 100));
    feeAmount = Math.max(minFee, Math.min(maxFee, feeAmount));

    const totalAmount = amount + feeAmount;

    // Generate transaction ID
    const transactionId = await this.generateTransactionId();

    // Create escrow
    const escrow = this.escrowRepository.create({
      transactionId,
      buyerId,
      sellerId,
      title,
      description,
      type: type || TransactionType.PRODUCT,
      amount,
      feeAmount,
      totalAmount,
      status: TransactionStatus.PENDING,
      createdBy: userId,
      expiresAt: this.calculateExpiryDate(),
      autoCancelAt: this.calculateAutoCancelDate(),
    });

    const saved = await this.escrowRepository.save(escrow);

    // Log event
    await this.logEscrowEvent(
      saved.id,
      'CREATED',
      null,
      TransactionStatus.PENDING,
      userId,
      'system',
      'Escrow transaction created',
    );

    // Send notifications
    await this.notificationsService.sendToUser(buyerId, {
      type: 'transaction',
      title: 'New Escrow Transaction',
      message: `You have been invited to an escrow transaction: ${title}`,
      referenceType: 'escrow',
      referenceId: saved.id,
      actionUrl: `/escrow/${saved.transactionId}`,
    });

    await this.notificationsService.sendToUser(sellerId, {
      type: 'transaction',
      title: 'New Escrow Transaction',
      message: `A new escrow transaction has been created: ${title}`,
      referenceType: 'escrow',
      referenceId: saved.id,
      actionUrl: `/escrow/${saved.transactionId}`,
    });

    // Emit event
    this.eventEmitter.emit('escrow.created', saved);

    this.logger.log(`Escrow created: ${saved.transactionId}`);

    return saved;
  }

  /**
   * Fund escrow (buyer deposits payment)
   */
  async fundEscrow(
    escrowId: string,
    userId: string,
    paymentMethod: string = 'wallet',
  ): Promise<EscrowTransaction> {
    this.logger.log(`Funding escrow: ${escrowId} by user: ${userId}`);

    const escrow = await this.findEscrowById(escrowId);

    // Validate
    if (escrow.buyerId !== userId) {
      throw new ForbiddenException('Only the buyer can fund this escrow');
    }

    if (escrow.status !== TransactionStatus.PENDING) {
      throw new BadRequestException(
        `Cannot fund escrow in ${escrow.status} status`,
      );
    }

    // Process payment based on method
    if (paymentMethod === 'wallet') {
      // Deduct from buyer's wallet
      await this.walletService.deductFromEscrow(
        userId,
        escrow.totalAmount,
        escrow.id,
      );
    }
    // For other payment methods (Paystack), webhook will handle it

    // Update escrow status
    const oldStatus = escrow.status;
    escrow.status = TransactionStatus.FUNDED;
    escrow.fundedAt = new Date();

    const saved = await this.escrowRepository.save(escrow);

    // Log event
    await this.logEscrowEvent(
      saved.id,
      'FUNDED',
      oldStatus,
      TransactionStatus.FUNDED,
      userId,
      'buyer',
      `Escrow funded via ${paymentMethod}`,
    );

    // Notify seller
    await this.notificationsService.sendToUser(escrow.sellerId, {
      type: 'transaction',
      title: 'Escrow Funded',
      message: `Payment has been secured for: ${escrow.title}. You can now proceed with delivery.`,
      referenceType: 'escrow',
      referenceId: saved.id,
      actionUrl: `/escrow/${saved.transactionId}`,
    });

    // Emit event
    this.eventEmitter.emit('escrow.funded', saved);

    this.logger.log(`Escrow funded: ${saved.transactionId}`);

    return saved;
  }

  /**
   * Confirm delivery (seller marks as delivered)
   */
  async confirmDelivery(
    escrowId: string,
    userId: string,
    trackingInfo?: string,
  ): Promise<EscrowTransaction> {
    this.logger.log(`Confirming delivery for escrow: ${escrowId}`);

    const escrow = await this.findEscrowById(escrowId);

    // Validate
    if (escrow.sellerId !== userId) {
      throw new ForbiddenException('Only the seller can confirm delivery');
    }

    if (escrow.status !== TransactionStatus.FUNDED) {
      throw new BadRequestException(
        `Cannot confirm delivery in ${escrow.status} status`,
      );
    }

    // Update escrow
    const oldStatus = escrow.status;
    escrow.status = TransactionStatus.DELIVERED;
    escrow.deliveredAt = new Date();
    if (trackingInfo) {
      escrow.trackingNumber = trackingInfo;
    }

    const saved = await this.escrowRepository.save(escrow);

    // Log event
    await this.logEscrowEvent(
      saved.id,
      'DELIVERED',
      oldStatus,
      TransactionStatus.DELIVERED,
      userId,
      'seller',
      'Delivery confirmed by seller',
    );

    // Notify buyer
    await this.notificationsService.sendToUser(escrow.buyerId, {
      type: 'transaction',
      title: 'Item Delivered',
      message: `${escrow.title} has been marked as delivered. Please confirm receipt.`,
      referenceType: 'escrow',
      referenceId: saved.id,
      actionUrl: `/escrow/${saved.transactionId}`,
    });

    // Emit event
    this.eventEmitter.emit('escrow.delivered', saved);

    this.logger.log(`Delivery confirmed: ${saved.transactionId}`);

    return saved;
  }

  /**
   * Confirm receipt (buyer confirms delivery)
   */
  async confirmReceipt(
    escrowId: string,
    userId: string,
  ): Promise<EscrowTransaction> {
    this.logger.log(`Confirming receipt for escrow: ${escrowId}`);

    const escrow = await this.findEscrowById(escrowId);

    // Validate
    if (escrow.buyerId !== userId) {
      throw new ForbiddenException('Only the buyer can confirm receipt');
    }

    if (escrow.status !== TransactionStatus.DELIVERED) {
      throw new BadRequestException(
        `Cannot confirm receipt in ${escrow.status} status`,
      );
    }

    // Release payment to seller
    await this.walletService.releaseToSeller(
      escrow.sellerId,
      escrow.amount,
      escrow.id,
    );

    // Update escrow
    const oldStatus = escrow.status;
    escrow.status = TransactionStatus.COMPLETED;
    escrow.completedAt = new Date();

    const saved = await this.escrowRepository.save(escrow);

    // Log event
    await this.logEscrowEvent(
      saved.id,
      'COMPLETED',
      oldStatus,
      TransactionStatus.COMPLETED,
      userId,
      'buyer',
      'Delivery confirmed by buyer, payment released',
    );

    // Notify seller
    await this.notificationsService.sendToUser(escrow.sellerId, {
      type: 'transaction',
      title: 'Payment Released',
      message: `Payment of ${saved.formattedAmount} has been released for: ${escrow.title}`,
      referenceType: 'escrow',
      referenceId: saved.id,
    });

    // Update trust scores
    await this.trustScoreService.calculateTrustScore(escrow.buyerId);
    await this.trustScoreService.calculateTrustScore(escrow.sellerId);

    // Emit event
    this.eventEmitter.emit('escrow.completed', saved);

    this.logger.log(`Escrow completed: ${saved.transactionId}`);

    return saved;
  }

  /**
   * Cancel escrow
   */
  async cancelEscrow(
    escrowId: string,
    userId: string,
    reason?: string,
  ): Promise<EscrowTransaction> {
    this.logger.log(`Cancelling escrow: ${escrowId}`);

    const escrow = await this.findEscrowById(escrowId);

    // Validate
    if (escrow.buyerId !== userId && escrow.sellerId !== userId) {
      throw new ForbiddenException('Only parties can cancel this escrow');
    }

    if (!escrow.canBeCancelled) {
      throw new BadRequestException(
        `Cannot cancel escrow in ${escrow.status} status`,
      );
    }

    // Refund buyer if funded
    if (escrow.status === TransactionStatus.FUNDED) {
      await this.walletService.refund(
        escrow.buyerId,
        escrow.totalAmount,
        escrow.id,
      );
    }

    // Update escrow
    const oldStatus = escrow.status;
    escrow.status = TransactionStatus.CANCELLED;
    escrow.cancelledAt = new Date();
    escrow.cancelledBy = userId;
    escrow.cancellationReason = reason;

    const saved = await this.escrowRepository.save(escrow);

    // Log event
    await this.logEscrowEvent(
      saved.id,
      'CANCELLED',
      oldStatus,
      TransactionStatus.CANCELLED,
      userId,
      escrow.buyerId === userId ? 'buyer' : 'seller',
      reason || 'Cancelled by user',
    );

    // Notify other party
    const otherPartyId =
      escrow.buyerId === userId ? escrow.sellerId : escrow.buyerId;
    await this.notificationsService.sendToUser(otherPartyId, {
      type: 'transaction',
      title: 'Escrow Cancelled',
      message: `The escrow transaction "${escrow.title}" has been cancelled.`,
      referenceType: 'escrow',
      referenceId: saved.id,
    });

    // Emit event
    this.eventEmitter.emit('escrow.cancelled', saved);

    this.logger.log(`Escrow cancelled: ${saved.transactionId}`);

    return saved;
  }

  /**
   * Get escrow by ID
   */
  async findEscrowById(id: string): Promise<EscrowTransaction> {
    const escrow = await this.escrowRepository.findOne({
      where: { id },
      relations: ['buyer', 'seller', 'events'],
    });

    if (!escrow) {
      throw new NotFoundException('Escrow transaction not found');
    }

    return escrow;
  }

  /**
   * Get escrow by transaction ID
   */
  async findByTransactionId(transactionId: string): Promise<EscrowTransaction> {
    const escrow = await this.escrowRepository.findOne({
      where: { transactionId },
      relations: ['buyer', 'seller', 'events'],
    });

    if (!escrow) {
      throw new NotFoundException('Escrow transaction not found');
    }

    return escrow;
  }

  /**
   * Get user's escrows
   */
  async getUserEscrows(
    userId: string,
    status?: TransactionStatus,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    data: EscrowTransaction[];
    total: number;
    page: number;
    limit: number;
  }> {
    const where: any = [
      { buyerId: userId },
      { sellerId: userId },
    ];

    if (status) {
      where.forEach((w: any) => (w.status = status));
    }

    const [data, total] = await this.escrowRepository.findAndCount({
      where,
      relations: ['buyer', 'seller'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  /**
   * Get active escrows count
   */
  async getActiveEscrowsCount(userId: string): Promise<number> {
    return this.escrowRepository.count({
      where: [
        { buyerId: userId, status: TransactionStatus.FUNDED },
        { sellerId: userId, status: TransactionStatus.FUNDED },
        { buyerId: userId, status: TransactionStatus.DELIVERED },
        { sellerId: userId, status: TransactionStatus.DELIVERED },
      ],
    });
  }

  /**
   * Generate unique transaction ID
   */
  private async generateTransactionId(): Promise<string> {
    const prefix = 'PXL';
    const year = new Date().getFullYear();

    // Get count of transactions this year
    const count = await this.escrowRepository.count({
      where: {
        createdAt: LessThan(new Date(year + 1, 0, 1)),
      },
    });

    const sequence = (count + 1).toString().padStart(6, '0');
    return `${prefix}-${year}-${sequence}`;
  }

  /**
   * Calculate expiry date
   */
  private calculateExpiryDate(): Date {
    const hours = this.configService.get('escrow.expiryHours', 72);
    return new Date(Date.now() + hours * 60 * 60 * 1000);
  }

  /**
   * Calculate auto-cancel date
   */
  private calculateAutoCancelDate(): Date {
    const hours = this.configService.get('escrow.autoCancelHours', 168);
    return new Date(Date.now() + hours * 60 * 60 * 1000);
  }

  /**
   * Log escrow event
   */
  private async logEscrowEvent(
    escrowId: string,
    action: string,
    fromStatus: TransactionStatus | null,
    toStatus: TransactionStatus,
    performedBy: string,
    performedByRole: string,
    notes?: string,
  ): Promise<void> {
    const event = this.eventRepository.create({
      escrowId,
      action,
      fromStatus,
      toStatus,
      performedBy,
      performedByRole,
      notes,
    });

    await this.eventRepository.save(event);
  }

  /**
   * Auto-cancel expired escrows (runs every hour)
   */
  @Cron(CronExpression.EVERY_HOUR)
  async autoCancelExpiredEscrows(): Promise<void> {
    this.logger.log('Running auto-cancel job for expired escrows');

    const expiredEscrows = await this.escrowRepository.find({
      where: {
        status: TransactionStatus.PENDING,
        autoCancelAt: LessThan(new Date()),
      },
    });

    for (const escrow of expiredEscrows) {
      try {
        escrow.status = TransactionStatus.CANCELLED;
        escrow.cancelledAt = new Date();
        escrow.cancellationReason = 'Auto-cancelled due to inactivity';

        await this.escrowRepository.save(escrow);

        await this.logEscrowEvent(
          escrow.id,
          'AUTO_CANCELLED',
          TransactionStatus.PENDING,
          TransactionStatus.CANCELLED,
          null,
          'system',
          'Auto-cancelled due to inactivity',
        );

        this.logger.log(`Auto-cancelled escrow: ${escrow.transactionId}`);
      } catch (error) {
        this.logger.error(
          `Failed to auto-cancel escrow ${escrow.transactionId}:`,
          error.message,
        );
      }
    }
  }

  /**
   * Get escrow statistics
   */
  async getStatistics(): Promise<{
    total: number;
    pending: number;
    funded: number;
    completed: number;
    cancelled: number;
    disputed: number;
    totalVolume: number;
    totalFees: number;
  }> {
    const [
      total,
      pending,
      funded,
      completed,
      cancelled,
      disputed,
      volumeResult,
      feesResult,
    ] = await Promise.all([
      this.escrowRepository.count(),
      this.escrowRepository.count({ where: { status: TransactionStatus.PENDING } }),
      this.escrowRepository.count({ where: { status: TransactionStatus.FUNDED } }),
      this.escrowRepository.count({ where: { status: TransactionStatus.COMPLETED } }),
      this.escrowRepository.count({ where: { status: TransactionStatus.CANCELLED } }),
      this.escrowRepository.count({ where: { status: TransactionStatus.DISPUTED } }),
      this.escrowRepository
        .createQueryBuilder('escrow')
        .select('SUM(escrow.amount)', 'total')
        .getRawOne(),
      this.escrowRepository
        .createQueryBuilder('escrow')
        .select('SUM(escrow.feeAmount)', 'total')
        .getRawOne(),
    ]);

    return {
      total,
      pending,
      funded,
      completed,
      cancelled,
      disputed,
      totalVolume: parseInt(volumeResult?.total || '0', 10),
      totalFees: parseInt(feesResult?.total || '0', 10),
    };
  }
}
