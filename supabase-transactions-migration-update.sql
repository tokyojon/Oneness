-- Migration script to add missing columns to transactions table
-- Run this in Supabase SQL Editor if the table already exists

-- Add missing columns for Stripe integration
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS amount DECIMAL(20,8);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS currency VARCHAR(20);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS jpy_amount DECIMAL(20,2);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;

-- Update status check constraint to include new statuses
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_status_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_status_check
CHECK (status IN ('pending', 'pending_approval', 'approved', 'completed', 'failed', 'rejected', 'cancelled'));

-- Update type check constraint to include new types
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_type_check
CHECK (type IN ('exchange', 'purchase', 'tip', 'donation'));
