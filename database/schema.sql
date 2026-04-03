-- =============================================================================
-- PEEPLX ESCROW PLATFORM - DATABASE SCHEMA
-- Production-Ready PostgreSQL Schema
-- Version: 1.0.0
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- ENUM TYPES
-- =============================================================================

CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'banned');
CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');
CREATE TYPE transaction_status AS ENUM (
    'pending', 
    'funded', 
    'in_progress', 
    'delivered', 
    'completed', 
    'cancelled', 
    'disputed'
);
CREATE TYPE transaction_type AS ENUM ('product', 'service', 'crypto');
CREATE TYPE dispute_status AS ENUM ('open', 'under_review', 'resolved_buyer', 'resolved_seller', 'closed');
CREATE TYPE notification_type AS ENUM ('transaction', 'dispute', 'payment', 'trust_score', 'system');
CREATE TYPE payment_method AS ENUM ('paystack', 'bank_transfer', 'crypto');
CREATE TYPE escrow_action AS ENUM ('fund', 'release', 'refund', 'dispute_hold');

-- =============================================================================
-- USERS TABLE
-- =============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    username VARCHAR(50) UNIQUE,
    
    -- Identity Verification (BVN/NIN for Nigeria)
    bvn VARCHAR(11),
    nin VARCHAR(11),
    id_verification_status verification_status DEFAULT 'unverified',
    id_verified_at TIMESTAMP,
    
    -- Profile
    avatar_url TEXT,
    bio TEXT,
    location VARCHAR(100),
    
    -- Account Status
    role user_role DEFAULT 'user',
    status user_status DEFAULT 'active',
    is_email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    
    -- Security
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    last_login_at TIMESTAMP,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Indexes
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_verification ON users(id_verification_status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- =============================================================================
-- USER WALLETS TABLE
-- =============================================================================

CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Balance (in kobo/smallest currency unit)
    available_balance BIGINT DEFAULT 0,
    escrow_locked_balance BIGINT DEFAULT 0,
    pending_balance BIGINT DEFAULT 0,
    
    -- Currency
    currency VARCHAR(3) DEFAULT 'NGN',
    
    -- Security
    wallet_address VARCHAR(255) UNIQUE, -- For crypto/internal transfers
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, currency)
);

CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_address ON wallets(wallet_address);

-- =============================================================================
-- WALLET TRANSACTIONS TABLE
-- =============================================================================

CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Transaction Details
    amount BIGINT NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'credit', 'debit'
    purpose VARCHAR(50) NOT NULL, -- 'deposit', 'withdrawal', 'escrow_fund', 'escrow_release', 'fee', 'refund'
    
    -- Reference
    reference VARCHAR(255) UNIQUE NOT NULL,
    external_reference VARCHAR(255), -- Paystack reference
    
    -- Related Records
    escrow_id UUID,
    metadata JSONB,
    
    -- Status
    status VARCHAR(20) DEFAULT 'completed',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT positive_amount CHECK (amount > 0)
);

CREATE INDEX idx_wallet_transactions_wallet ON wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_transactions_user ON wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_reference ON wallet_transactions(reference);
CREATE INDEX idx_wallet_transactions_created ON wallet_transactions(created_at);

-- =============================================================================
-- ESCROW TRANSACTIONS TABLE
-- =============================================================================

CREATE TABLE escrow_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id VARCHAR(50) UNIQUE NOT NULL, -- Human-readable ID (e.g., PXL-2024-000001)
    
    -- Parties
    buyer_id UUID NOT NULL REFERENCES users(id),
    seller_id UUID NOT NULL REFERENCES users(id),
    
    -- Transaction Details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type transaction_type DEFAULT 'product',
    
    -- Financial
    amount BIGINT NOT NULL,
    fee_amount BIGINT NOT NULL,
    total_amount BIGINT NOT NULL,
    currency VARCHAR(3) DEFAULT 'NGN',
    
    -- Status Workflow
    status transaction_status DEFAULT 'pending',
    
    -- Timeline
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    funded_at TIMESTAMP,
    delivered_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    
    -- Expiry
    expires_at TIMESTAMP,
    auto_cancel_at TIMESTAMP,
    
    -- Delivery
    delivery_method VARCHAR(50),
    delivery_address TEXT,
    tracking_number VARCHAR(100),
    
    -- Terms
    terms_accepted_by_buyer BOOLEAN DEFAULT FALSE,
    terms_accepted_by_seller BOOLEAN DEFAULT FALSE,
    terms_accepted_at TIMESTAMP,
    
    -- Cancellation
    cancelled_by UUID REFERENCES users(id),
    cancellation_reason TEXT,
    
    -- Metadata
    metadata JSONB,
    
    created_by UUID NOT NULL REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT positive_escrow_amount CHECK (amount > 0),
    CONSTRAINT different_parties CHECK (buyer_id != seller_id)
);

CREATE INDEX idx_escrow_buyer ON escrow_transactions(buyer_id);
CREATE INDEX idx_escrow_seller ON escrow_transactions(seller_id);
CREATE INDEX idx_escrow_status ON escrow_transactions(status);
CREATE INDEX idx_escrow_transaction_id ON escrow_transactions(transaction_id);
CREATE INDEX idx_escrow_created ON escrow_transactions(created_at);
CREATE INDEX idx_escrow_expires ON escrow_transactions(expires_at);

-- =============================================================================
-- ESCROW EVENTS/AUDIT LOG TABLE
-- =============================================================================

CREATE TABLE escrow_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    escrow_id UUID NOT NULL REFERENCES escrow_transactions(id) ON DELETE CASCADE,
    
    -- Event Details
    action VARCHAR(50) NOT NULL,
    from_status transaction_status,
    to_status transaction_status,
    
    -- Actor
    performed_by UUID REFERENCES users(id),
    performed_by_role VARCHAR(20), -- 'buyer', 'seller', 'system', 'admin'
    
    -- Details
    notes TEXT,
    metadata JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_escrow_events_escrow ON escrow_events(escrow_id);
CREATE INDEX idx_escrow_events_created ON escrow_events(created_at);

-- =============================================================================
-- DISPUTES TABLE
-- =============================================================================

CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispute_id VARCHAR(50) UNIQUE NOT NULL,
    
    -- Related Transaction
    escrow_id UUID NOT NULL REFERENCES escrow_transactions(id),
    buyer_id UUID NOT NULL REFERENCES users(id),
    seller_id UUID NOT NULL REFERENCES users(id),
    
    -- Initiator
    opened_by UUID NOT NULL REFERENCES users(id),
    opened_by_role VARCHAR(20) NOT NULL, -- 'buyer', 'seller'
    
    -- Details
    reason TEXT NOT NULL,
    description TEXT NOT NULL,
    desired_outcome TEXT,
    
    -- Status
    status dispute_status DEFAULT 'open',
    
    -- Resolution
    resolved_by UUID REFERENCES users(id),
    resolution_notes TEXT,
    resolution_amount BIGINT, -- If partial refund/payment
    resolved_at TIMESTAMP,
    
    -- Timeline
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Priority
    priority INTEGER DEFAULT 1, -- 1=low, 2=medium, 3=high, 4=urgent
    
    metadata JSONB
);

CREATE INDEX idx_disputes_escrow ON disputes(escrow_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_buyer ON disputes(buyer_id);
CREATE INDEX idx_disputes_seller ON disputes(seller_id);
CREATE INDEX idx_disputes_priority ON disputes(priority);
CREATE INDEX idx_disputes_created ON disputes(created_at);

-- =============================================================================
-- DISPUTE EVIDENCE TABLE
-- =============================================================================

CREATE TABLE dispute_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
    submitted_by UUID NOT NULL REFERENCES users(id),
    
    -- Evidence
    evidence_type VARCHAR(50) NOT NULL, -- 'image', 'document', 'chat_log', 'receipt', 'other'
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_size INTEGER,
    
    -- Description
    description TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dispute_evidence_dispute ON dispute_evidence(dispute_id);

-- =============================================================================
-- TRUST SCORES TABLE (PORTABLE TRUST SYSTEM)
-- =============================================================================

CREATE TABLE trust_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- Core Score (0-100)
    overall_score INTEGER DEFAULT 0,
    score_level VARCHAR(20) DEFAULT 'new_trader', -- 'new_trader', 'verified_trader', 'trusted_trader', 'elite_trader'
    
    -- Component Scores
    transaction_score INTEGER DEFAULT 0, -- Based on completed transactions
    value_score INTEGER DEFAULT 0, -- Based on total transaction value
    dispute_score INTEGER DEFAULT 0, -- Based on dispute rate
    verification_score INTEGER DEFAULT 0, -- Based on ID verification
    longevity_score INTEGER DEFAULT 0, -- Based on account age
    review_score INTEGER DEFAULT 0, -- Based on community reviews
    
    -- Statistics
    total_transactions INTEGER DEFAULT 0,
    total_transaction_value BIGINT DEFAULT 0,
    successful_transactions INTEGER DEFAULT 0,
    disputed_transactions INTEGER DEFAULT 0,
    cancelled_transactions INTEGER DEFAULT 0,
    
    -- As Buyer
    buyer_transactions INTEGER DEFAULT 0,
    buyer_success_rate DECIMAL(5,2) DEFAULT 0,
    
    -- As Seller
    seller_transactions INTEGER DEFAULT 0,
    seller_success_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Reviews
    total_reviews INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    
    -- Fraud Detection
    risk_flags INTEGER DEFAULT 0,
    is_flagged BOOLEAN DEFAULT FALSE,
    flagged_reason TEXT,
    
    -- Public Profile
    public_profile_enabled BOOLEAN DEFAULT TRUE,
    profile_views INTEGER DEFAULT 0,
    
    -- Score History
    highest_score INTEGER DEFAULT 0,
    lowest_score INTEGER DEFAULT 0,
    score_history JSONB DEFAULT '[]'::jsonb,
    
    -- Timestamps
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_score_range CHECK (overall_score >= 0 AND overall_score <= 100)
);

CREATE INDEX idx_trust_scores_user ON trust_scores(user_id);
CREATE INDEX idx_trust_scores_overall ON trust_scores(overall_score);
CREATE INDEX idx_trust_scores_level ON trust_scores(score_level);
CREATE INDEX idx_trust_scores_flagged ON trust_scores(is_flagged);

-- =============================================================================
-- REVIEWS/RATINGS TABLE
-- =============================================================================

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Related Transaction
    escrow_id UUID NOT NULL REFERENCES escrow_transactions(id),
    reviewer_id UUID NOT NULL REFERENCES users(id),
    reviewee_id UUID NOT NULL REFERENCES users(id),
    
    -- Review Content
    rating INTEGER NOT NULL, -- 1-5 stars
    title VARCHAR(255),
    comment TEXT,
    
    -- Verification
    is_verified BOOLEAN DEFAULT FALSE, -- Only verified if transaction completed
    
    -- Moderation
    is_visible BOOLEAN DEFAULT TRUE,
    is_flagged BOOLEAN DEFAULT FALSE,
    flagged_reason TEXT,
    
    -- Response
    response TEXT,
    responded_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_rating CHECK (rating >= 1 AND rating <= 5),
    CONSTRAINT different_users CHECK (reviewer_id != reviewee_id),
    UNIQUE(escrow_id, reviewer_id)
);

CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created ON reviews(created_at);

-- =============================================================================
-- NOTIFICATIONS TABLE
-- =============================================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Content
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Related Entity
    reference_type VARCHAR(50), -- 'escrow', 'dispute', 'wallet'
    reference_id UUID,
    
    -- Action
    action_url TEXT,
    action_text VARCHAR(100),
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    
    -- Delivery
    email_sent BOOLEAN DEFAULT FALSE,
    push_sent BOOLEAN DEFAULT FALSE,
    sms_sent BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- =============================================================================
-- PAYSTACK PAYMENTS TABLE
-- =============================================================================

CREATE TABLE paystack_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    user_id UUID NOT NULL REFERENCES users(id),
    escrow_id UUID REFERENCES escrow_transactions(id),
    wallet_transaction_id UUID REFERENCES wallet_transactions(id),
    
    -- Paystack Data
    paystack_reference VARCHAR(255) UNIQUE NOT NULL,
    paystack_transaction_id VARCHAR(255),
    
    -- Payment Details
    amount BIGINT NOT NULL,
    fee BIGINT DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'NGN',
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'success', 'failed', 'abandoned'
    
    -- Customer Info
    email VARCHAR(255) NOT NULL,
    
    -- Authorization (for recurring payments)
    authorization_code VARCHAR(255),
    card_type VARCHAR(50),
    last4 VARCHAR(4),
    exp_month VARCHAR(2),
    exp_year VARCHAR(4),
    bank VARCHAR(100),
    brand VARCHAR(50),
    
    -- Metadata
    metadata JSONB,
    
    -- Timeline
    paid_at TIMESTAMP,
    failed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_paystack_user ON paystack_payments(user_id);
CREATE INDEX idx_paystack_reference ON paystack_payments(paystack_reference);
CREATE INDEX idx_paystack_status ON paystack_payments(status);
CREATE INDEX idx_paystack_escrow ON paystack_payments(escrow_id);

-- =============================================================================
-- BANK ACCOUNTS TABLE (For Withdrawals)
-- =============================================================================

CREATE TABLE bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Bank Details
    bank_name VARCHAR(100) NOT NULL,
    bank_code VARCHAR(10) NOT NULL,
    account_number VARCHAR(20) NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    
    -- Verification
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    
    -- Status
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    recipient_code VARCHAR(255), -- Paystack recipient code
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, account_number, bank_code)
);

CREATE INDEX idx_bank_accounts_user ON bank_accounts(user_id);
CREATE INDEX idx_bank_accounts_default ON bank_accounts(is_default);

-- =============================================================================
-- WITHDRAWALS TABLE
-- =============================================================================

CREATE TABLE withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    bank_account_id UUID NOT NULL REFERENCES bank_accounts(id),
    wallet_transaction_id UUID REFERENCES wallet_transactions(id),
    
    -- Amount
    amount BIGINT NOT NULL,
    fee BIGINT DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    
    -- Transfer Details
    transfer_code VARCHAR(255), -- Paystack transfer code
    reference VARCHAR(255) UNIQUE NOT NULL,
    
    -- Timeline
    processed_at TIMESTAMP,
    completed_at TIMESTAMP,
    failed_at TIMESTAMP,
    failure_reason TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_withdrawals_user ON withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
CREATE INDEX idx_withdrawals_reference ON withdrawals(reference);

-- =============================================================================
-- FRAUD DETECTION / SUSPICIOUS ACTIVITY TABLE
-- =============================================================================

CREATE TABLE fraud_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Subject
    user_id UUID REFERENCES users(id),
    escrow_id UUID REFERENCES escrow_transactions(id),
    
    -- Alert Details
    alert_type VARCHAR(50) NOT NULL, -- 'velocity', 'amount', 'location', 'device', 'pattern'
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    description TEXT NOT NULL,
    
    -- Evidence
    evidence JSONB,
    
    -- Status
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'investigating', 'resolved', 'false_positive'
    
    -- Resolution
    resolved_by UUID REFERENCES users(id),
    resolution_notes TEXT,
    resolved_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fraud_alerts_user ON fraud_alerts(user_id);
CREATE INDEX idx_fraud_alerts_status ON fraud_alerts(status);
CREATE INDEX idx_fraud_alerts_severity ON fraud_alerts(severity);
CREATE INDEX idx_fraud_alerts_created ON fraud_alerts(created_at);

-- =============================================================================
-- API KEYS TABLE (For Marketplace Integrations)
-- =============================================================================

CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Key Details
    key_name VARCHAR(100) NOT NULL,
    api_key_hash VARCHAR(255) NOT NULL,
    api_key_preview VARCHAR(20), -- Last 4 characters for display
    
    -- Permissions
    permissions JSONB DEFAULT '["read"]'::jsonb,
    
    -- Usage
    request_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_active ON api_keys(is_active);

-- =============================================================================
-- AUDIT LOG TABLE
-- =============================================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Actor
    user_id UUID REFERENCES users(id),
    user_role VARCHAR(20),
    
    -- Action
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    
    -- Details
    old_values JSONB,
    new_values JSONB,
    metadata JSONB,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_escrow_transactions_updated_at BEFORE UPDATE ON escrow_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON disputes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trust_scores_updated_at BEFORE UPDATE ON trust_scores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_paystack_payments_updated_at BEFORE UPDATE ON paystack_payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON bank_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_withdrawals_updated_at BEFORE UPDATE ON withdrawals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fraud_alerts_updated_at BEFORE UPDATE ON fraud_alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trust Score Level Update Function
CREATE OR REPLACE FUNCTION update_trust_score_level()
RETURNS TRIGGER AS $$
BEGIN
    NEW.score_level := CASE
        WHEN NEW.overall_score >= 85 THEN 'elite_trader'
        WHEN NEW.overall_score >= 60 THEN 'trusted_trader'
        WHEN NEW.overall_score >= 30 THEN 'verified_trader'
        ELSE 'new_trader'
    END;
    NEW.calculated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_trust_level BEFORE INSERT OR UPDATE ON trust_scores
    FOR EACH ROW EXECUTE FUNCTION update_trust_score_level();

-- =============================================================================
-- INITIAL DATA
-- =============================================================================

-- Create admin user (password should be changed immediately)
INSERT INTO users (email, password_hash, first_name, last_name, role, is_email_verified, email_verified_at)
VALUES (
    'admin@peeplx.com',
    '$2b$10$YourHashedPasswordHere', -- Replace with actual bcrypt hash
    'System',
    'Administrator',
    'super_admin',
    TRUE,
    CURRENT_TIMESTAMP
);

-- Create default trust score for admin
INSERT INTO trust_scores (user_id, overall_score, score_level)
SELECT id, 100, 'elite_trader' FROM users WHERE email = 'admin@peeplx.com';

-- Create admin wallet
INSERT INTO wallets (user_id, available_balance, currency)
SELECT id, 0, 'NGN' FROM users WHERE email = 'admin@peeplx.com';
