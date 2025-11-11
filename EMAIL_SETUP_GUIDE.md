# Supabase Email Configuration Setup Guide

## Overview
This guide will help you configure the email settings in Supabase to send password reset emails from "Oneness Kingdom" with the correct reply-to address and signature.

## Steps to Configure

### 1. Update Environment Variables
Make sure your `.env.local` file has the correct site URL:
```
NEXT_PUBLIC_SITE_URL=https://onenesskingdom.world
```

### 2. Run SQL Configuration Script
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New query**
4. Copy and paste the contents of `supabase-email-config.sql`
5. Click **Run** to execute the script

### 3. Configure SMTP Settings in Supabase
1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Scroll down to **Email Settings**
3. Configure the following settings:

#### SMTP Provider Settings:
- **Enable custom SMTP**: Toggle this ON
- **Sender name**: `Oneness Kingdom`
- **Sender email**: `noreply@onenesskingdom.world` (or your verified domain)
- **Reply-to email**: `onenesskingdom2@gmail.com`

#### SMTP Configuration:
Choose one of the following options:

**Option A: Use Supabase's built-in email service (Recommended for development)**
- Keep SMTP settings disabled for testing
- Supabase will send emails from their default service

**Option B: Use Gmail SMTP (For production)**
- **SMTP Host**: `smtp.gmail.com`
- **SMTP Port**: `587`
- **SMTP User**: `onenesskingdom2@gmail.com`
- **SMTP Password**: Your Gmail app password
- **SMTP Authentication**: `PLAIN`
- **SMTP Encryption**: `STARTTLS`

### 4. Gmail App Password Setup (if using Gmail)
1. Enable 2-factor authentication on your Gmail account
2. Go to Google Account settings → Security
3. Click on "App passwords"
4. Generate a new app password for "Mail" on "Other device"
5. Use this 16-character password in the SMTP configuration

### 5. Test the Configuration
1. Deploy your application with the updated environment variables
2. Go to the forgot password page: `https://onenesskingdom.world/forgot-password`
3. Enter your email address
4. Check your email (including spam folder)
5. Verify that:
   - The sender shows "Oneness Kingdom"
   - The reply-to address is `onenesskingdom2@gmail.com`
   - The reset link points to `https://onenesskingdom.world/reset-password`
   - The email signature shows "Regards, Oneness Kingdom Team"

## Troubleshooting

### Emails not sending:
- Check your SMTP configuration
- Verify email/password credentials
- Ensure 2FA is enabled and app password is used for Gmail
- Check Supabase logs for error messages

### Wrong redirect URL:
- Ensure `NEXT_PUBLIC_SITE_URL` is set correctly in your environment
- Check that the SQL configuration script was executed
- Verify the site URL in Supabase Authentication settings

### Email formatting issues:
- Ensure the SQL template updates were applied correctly
- Check that HTML is properly formatted in the templates
- Test with different email clients

## Production Deployment Checklist
- [ ] Environment variables updated
- [ ] SQL configuration script executed
- [ ] SMTP provider configured
- [ ] Email templates verified
- [ ] Test email sent successfully
- [ ] Spam folder checked
- [ ] Reply-to address working
- [ ] Redirect URLs pointing to correct domain
