# Stripe Integration Test Script
# Use this to test the payment flow in development

# 1. Set up test environment variables
echo "Make sure these environment variables are set:"
echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_..."
echo "STRIPE_SECRET_KEY=sk_test_..."
echo "STRIPE_WEBHOOK_SECRET=whsec_..."

# 2. Test card numbers for Stripe
echo "Test card numbers:"
echo "Success: 4242 4242 4242 4242"
echo "Decline: 4000 0000 0000 0002"
echo "Require authentication: 4000 0025 0000 3155"

# 3. Webhook testing
echo "To test webhooks locally, use Stripe CLI:"
echo "stripe listen --forward-to localhost:3000/api/payments/webhook"

# 4. Database migration
echo "Run this SQL in Supabase to update transactions table:"
cat supabase-transactions-migration-update.sql
