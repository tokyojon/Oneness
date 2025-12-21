# Supabase Email Configuration via Dashboard

Since your Supabase version doesn't have the `auth.email_templates` table, you'll need to configure emails through the dashboard.

## Step 1: Check Your Tables
First, run `supabase-check-tables.sql` to see what auth tables exist in your version.

## Step 2: Configure Site URL
1. Go to **Authentication** → **Settings** in your Supabase dashboard
2. Scroll down to **Site URL**
3. Set: `https://onenesskingdom.world`
4. Add to **Redirect URLs**: `https://onenesskingdom.world/auth/callback`

## Step 3: Configure Email Settings
1. In the same **Authentication** → **Settings** page
2. Scroll down to **Email Settings**
3. Set:
   - **Sender name**: `Oneness Kingdom`
   - **Reply-to email**: `onenesskingdom2@gmail.com`

## Step 4: Configure SMTP (Optional but Recommended)
For better deliverability, configure custom SMTP:

### Option A: Use Supabase's Built-in Email
- Keep SMTP disabled
- Supabase will send from their default service
- Works for testing

### Option B: Configure Gmail SMTP
1. Enable **Custom SMTP**
2. Set:
   - **SMTP Host**: `smtp.gmail.com`
   - **SMTP Port**: `587`
   - **SMTP User**: `onenesskingdom2@gmail.com`
   - **SMTP Password**: Your Gmail app password
   - **SMTP Authentication**: `PLAIN`
   - **SMTP Encryption**: `STARTTLS`

## Step 5: Test the Configuration
1. Deploy your application with updated environment variables
2. Go to: `https://onenesskingdom.world/forgot-password`
3. Enter your email address
4. Check your email (including spam folder)

## Alternative: Create Custom Email Service
If dashboard configuration doesn't work, you can implement a custom email service:

### Create Email API Route
```typescript
// src/app/api/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  const { to, subject, html } = await request.json();
  
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: 'onenesskingdom2@gmail.com',
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: '"Oneness Kingdom" <onenesskingdom2@gmail.com>',
    to,
    subject,
    html,
  });

  return NextResponse.json({ success: true });
}
```

### Update Password Reset API
Then modify your reset password API to use this custom email service instead of Supabase's built-in emails.

## Current Status
- ✅ Site URL configured in environment variables
- ✅ API route updated to use correct domain
- ⏳ Dashboard configuration needed
- ⏳ Email template customization (if needed)

The password reset functionality should work once you configure the site URL and email settings in the Supabase dashboard.
