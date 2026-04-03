import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { EscrowEvent } from './escrow-event.entity';

export enum TransactionStatus {
  PENDING = 'pending',
  FUNDED = 'funded',
  IN_PROGRESS = 'in_progress',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
}

export enum TransactionType {
  PRODUCT = 'product',
  SERVICE = 'service',
  CRYPTO = 'crypto',
}

@Entity('escrow_transactions')
@Index(['buyerId', 'status'])
@Index(['sellerId', 'status'])
@Index(['status', 'createdAt'])
export class EscrowTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  transactionId: string;

  // Parties
  @Column({ type: 'uuid' })
  buyerId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'buyerId' })
  buyer: User;

  @Column({ type: 'uuid' })
  sellerId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'sellerId' })
  seller: User;

  // Transaction Details
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
    default: TransactionType.PRODUCT,
  })
  type: TransactionType;

  // Financial
  @Column({ type: 'bigint' })
  amount: number;

  @Column({ type: 'bigint' })
  feeAmount: number;

  @Column({ type: 'bigint' })
  totalAmount: number;

  @Column({ type: 'varchar', length: 3, default: 'NGN' })
  currency: string;

  // Status
  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  // Timeline
  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  fundedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt: Date;

  // Expiry
  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  autoCancelAt: Date;

  // Delivery
  @Column({ type: 'varchar', length: 50, nullable: true })
  deliveryMethod: string;

  @Column({ type: 'text', nullable: true })
  deliveryAddress: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  trackingNumber: string;

  // Terms
  @Column({ type: 'boolean', default: false })
  termsAcceptedByBuyer: boolean;

  @Column({ type: 'boolean', default: false })
  termsAcceptedBySeller: boolean;

  @Column({ type: 'timestamp', nullable: true })
  termsAcceptedAt: Date;

  // Cancellation
  @Column({ type: 'uuid', nullable: true })
  cancelledBy: string;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'uuid' })
  createdBy: string;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => EscrowEvent, (event) => event.escrow, {
    cascade: true,
  })
  events: EscrowEvent[];

  // Virtual fields
  get formattedAmount(): string {
    return `₦${(this.amount / 100).toLocaleString()}`;
  }

  get formattedFee(): string {
    return `₦${(this.feeAmount / 100).toLocaleString()}`;
  }

  get formattedTotal(): string {
    return `₦${(this.totalAmount / 100).toLocaleString()}`;
  }

  get isActive(): boolean {
    return [
      TransactionStatus.PENDING,
      TransactionStatus.FUNDED,
      TransactionStatus.IN_PROGRESS,
      TransactionStatus.DELIVERED,
    ].includes(this.status);
  }

  get canBeCancelled(): boolean {
    return [
      TransactionStatus.PENDING,
      TransactionStatus.FUNDED,
    ].includes(this.status);
  }

  get canBeDisputed(): boolean {
    return [
      TransactionStatus.DELIVERED,
      TransactionStatus.COMPLETED,
    ].includes(this.status);
  }

  get daysSinceCreated(): number {
    return Math.floor(
      (new Date().getTime() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );
  }

  get statusDisplay(): string {
    const displays = {
      [TransactionStatus.PENDING]: 'Awaiting Payment',
      [TransactionStatus.FUNDED]: 'Payment Secured',
      [TransactionStatus.IN_PROGRESS]: 'In Progress',
      [TransactionStatus.DELIVERED]: 'Delivered',
      [TransactionStatus.COMPLETED]: 'Completed',
      [TransactionStatus.CANCELLED]: 'Cancelled',
      [TransactionStatus.DISPUTED]: 'Under Dispute',
    };
    return displays[this.status] || this.status;
  }
}
