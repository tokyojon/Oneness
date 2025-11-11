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

### Optional: Neo4j Configuration (if using)
```bash
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-neo4j-password
```

## Hosting Provider Setup

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

## Supabase Dashboard Configuration

After fixing environment variables, configure Supabase:

1. Go to https://supabase.com/dashboard/project/edfixzjpvsqpebzehsqy
2. Authentication → Settings
3. Set Site URL: `https://onenesskingdom.world`
4. Add to Redirect URLs: `https://onenesskingdom.world/auth/callback`
5. Email Settings → Set Sender name: `Oneness Kingdom`
6. Email Settings → Set Reply-to: `onenesskingdom2@gmail.com`

## Verification Steps

After deployment:

1. ✅ Check that the site loads without environment variable errors
2. ✅ Test user registration
3. ✅ Test user login
4. ✅ Test forgot password functionality
5. ✅ Verify password reset emails are sent
6. ✅ Check that reset links point to `https://onenesskingdom.world`

## Common Issues

- **Missing SUPABASE_SERVICE_ROLE_KEY**: Add the environment variable
- **Wrong redirect URL**: Update Site URL in Supabase dashboard
- **Emails not sending**: Configure SMTP settings in Supabase
- **Build failures**: Check all environment variables are set

## Emergency Rollback

If anything goes wrong:
1. Revert to previous deployment
2. Check environment variable configuration
3. Verify Supabase settings
4. Test functionality before going live again
