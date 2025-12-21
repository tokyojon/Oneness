-- Add transactions table for exchange operations
-- Run this in your Supabase project dashboard: SQL Editor

-- Transactions table for exchange operations
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL CHECK (type IN ('exchange', 'purchase', 'tip', 'donation')),
  amount DECIMAL(20,8), -- OP amount for exchange/purchase
  currency VARCHAR(20), -- Target currency for exchange (JPY, USDT, BTC)
  jpy_amount DECIMAL(20,2), -- JPY equivalent for purchases
  from_currency VARCHAR(20) NOT NULL DEFAULT 'OP',
  to_currency VARCHAR(20),
  from_amount DECIMAL(20,8),
  to_amount DECIMAL(20,8),
  exchange_rate DECIMAL(20,8),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'pending_approval', 'approved', 'completed', 'failed', 'rejected', 'cancelled')),
  description TEXT,
  stripe_payment_intent_id VARCHAR(255), -- Stripe payment intent ID
  completed_at TIMESTAMP, -- When payment/exchange was completed
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add missing columns to existing table (run this if table already exists)
-- ALTER TABLE transactions ADD COLUMN IF NOT EXISTS amount DECIMAL(20,8);
-- ALTER TABLE transactions ADD COLUMN IF NOT EXISTS currency VARCHAR(20);
-- ALTER TABLE transactions ADD COLUMN IF NOT EXISTS jpy_amount DECIMAL(20,2);
-- ALTER TABLE transactions ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255);
-- ALTER TABLE transactions ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- Enable Row Level Security for transactions table
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for transactions table
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Sample query to test the table structure
-- SELECT * FROM transactions WHERE user_id = auth.uid() ORDER BY created_at DESC LIMIT 10;
