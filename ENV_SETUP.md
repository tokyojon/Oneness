# Environment Variables Setup

Create a `.env.local` file in the project root with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://edfixzjpvsqpebzehsqy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkZml4empwdnNxcGViemVoc3F5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NDA3NDgsImV4cCI6MjA3ODMxNjc0OH0.ozxPhLQHHwwFOL3IWFr_ZlTOVUkXYD_K8lBKSNajAw4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkZml4empwdnNxcGViemVoc3F5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc0MDc0OCwiZXhwIjoyMDc4MzE2NzQ4fQ.R6Lkx4i9lnjR4XsWicd-czadbePgnXWGDTIX-w2MGho

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Site URL for redirects
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Gemini AI Configuration (for Kawaii avatar generation)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# OAuth Configuration (for Google and Apple login)
# Configure these in your Supabase dashboard under Authentication → Providers

```

## Where to find Supabase credentials

1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the Project URL (NEXT_PUBLIC_SUPABASE_URL)
4. Copy the anon public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
5. Copy the service_role key (SUPABASE_SERVICE_ROLE_KEY) - keep this secret!

## OAuth Provider Setup

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to Credentials → Create OAuth 2.0 Client ID. 
5. Set authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
6. Copy the Client ID and Client Secret. 

### Apple OAuth
1. Go to [Apple Developer](https://developer.apple.com/)
2. Create an App ID with Sign In with Apple capability
3. Create a Services ID for Sign In with Apple
4. Configure the Services ID with your domain
5. Generate a private key
6. Copy the Services ID, Team ID, Private Key, and Key ID

### Configure in Supabase
1. Go to Authentication → Providers in your Supabase dashboard
2. Enable Google provider and enter Client ID/Secret
3. Enable Apple provider and enter Team ID, Services ID, Private Key, and Key ID
4. Set redirect URLs to match your site URL

## Gemini AI Setup

### Getting a Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key or use an existing one
4. Copy the API key and add it to your `.env.local` file as `NEXT_PUBLIC_GEMINI_API_KEY`

The Kawaii avatar generator uses Google's Gemini AI to create personalized anime-style caricatures from user photos or generate random characters.
