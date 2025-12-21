# Production Deployment Checklist

## Environment Variables Required

Copy these exact values to your production environment:

### Supabase Configuration
```bash
NEXT_PUBLIC_SUPABASE_URL=https://edfixzjpvsqpebzehsqy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkZml4empwdnNxcGViemVoc3F5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NDA3NDgsImV4cCI6MjA3ODMxNjc0OH0.ozxPhLQHHwwFOL3IWFr_ZlTOVUkXYD_K8lBKSNajAw4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkZml4empwdnNxcGViemVoc3F5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc0MDc0OCwiZXhwIjoyMDc4MzE2NzQ4fQ.R6Lkx4i9lnjR4XsWicd-czadbePgnXWGDTIX-w2MGho
NEXT_PUBLIC_SITE_URL=https://onenesskingdom.world
```

### Stripe Configuration
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... # Replace with live keys for production
STRIPE_SECRET_KEY=sk_live_... # Replace with live keys for production
STRIPE_WEBHOOK_SECRET=whsec_... # From Stripe webhook endpoint
```

### Optional: Neo4j Configuration (if using)
```bash
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-neo4j-password
```

## Hosting Provider Setup

### VPS Deployment
1. Ensure Node.js 18+ is installed on your VPS
2. Install PM2 globally: `npm install -g pm2`
3. Clone the repository to `/var/www/oneness`
4. Copy `.env.production` with production environment variables
5. Run `npm ci` to install dependencies
6. Run `npm run build` to build the application
7. Start with PM2: `pm2 start ecosystem.config.js`
8. Set up Nginx reverse proxy (recommended)
9. Configure SSL certificate with Let's Encrypt

### Vercel
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable above
3. Redeploy the application

### DigitalOcean App Platform
1. Go to App Platform → Your App → Settings → Components
2. Add environment variables
3. Redeploy the application

### Docker/Server
1. Create `.env` file with the variables above
2. Restart the application
3. Ensure the environment variables are loaded

## Stripe Setup

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard → Developers → API Keys
3. Set up webhook endpoint in Stripe Dashboard:
   - URL: `https://yourdomain.com/api/payments/webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## Supabase Dashboard Configuration

After fixing environment variables, configure Supabase:

1. Go to https://supabase.com/dashboard/project/edfixzjpvsqpebzehsqy
2. Authentication → Settings
3. Set Site URL: `https://onenesskingdom.world`
4. Add to Redirect URLs: `https://onenesskingdom.world/auth/callback`
5. Email Settings → Set Sender name: `Oneness Kingdom`
6. Email Settings → Set Reply-to: `onenesskingdom2@gmail.com`

## Team Post Generator Setup

The application includes an automated team post generator that creates inspirational content about peace, love, and harmony every 6 hours.

### On Your VPS:

```bash
# Navigate to your project directory
cd /var/www/oneness

# Run the cron setup script
./scripts/setup-team-post-cron.sh

# Verify the cron job was installed
crontab -l | grep "generate-team-post"

# Check that the script is executable
ls -la scripts/generate-team-post.js
```

### Expected Output:
```
# Oneness Kingdom Team Post Generator - Runs every 6 hours
0 */6 * * * cd /var/www/oneness && /usr/bin/node /var/www/oneness/scripts/generate-team-post.js >> /var/www/oneness/logs/team-post-generator.log 2>&1
```

### Test the Script Manually:
```bash
# Test the team post generator
node scripts/generate-team-post.js

# Check the logs
tail -f logs/team-post-generator.log
```

## User Profiles Migration

The signup process now collects additional profile information. Run the database migration:

```bash
# Connect to your Supabase database and run:
psql -h [your-db-host] -U postgres -d postgres -f enhanced-user-profiles-migration.sql

# Or run via Supabase SQL editor:
# Copy the contents of enhanced-user-profiles-migration.sql and execute
```

## Verification Steps

After deployment:

1. ✅ Check that the site loads without environment variable errors
2. ✅ Test user registration
3. ✅ Test user login
4. ✅ Test forgot password functionality
5. ✅ Verify password reset emails are sent
6. ✅ Check that reset links point to `https://onenesskingdom.world`
7. ✅ Test Kawaii avatar generator and saving functionality
8. ✅ Verify team post generation is working (check logs and posts table)
9. ✅ Test WKP purchase flow with Stripe (use test card: 4242 4242 4242 4242)
10. ✅ Test WKP exchange request submission
11. ✅ Verify webhook processing (check Stripe dashboard for events)

## Common Issues

- **Missing SUPABASE_SERVICE_ROLE_KEY**: Add the environment variable
- **Wrong redirect URL**: Update Site URL in Supabase dashboard
- **Emails not sending**: Configure SMTP settings in Supabase
- **Stripe payments not working**: Check API keys and webhook configuration
- **Build failures**: Check all environment variables are set
- **PM2 not starting**: Check Node.js version and ecosystem.config.js

## Emergency Rollback

If anything goes wrong:
1. Revert to previous deployment
2. Check environment variable configuration
3. Verify Supabase settings
4. Check Stripe webhook logs
5. Test functionality before going live again
