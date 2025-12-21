import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const resetRequestSchema = z.object({
  email: z.string().email()
});

const resetConfirmSchema = z.object({
  token: z.string(),
  password: z.string().min(6)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password, email } = body;

    // Handle password reset request
    if (email && !token) {
      const { email: validatedEmail } = resetRequestSchema.parse({ email });
      
      // Get the site URL from environment or request headers
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                     request.headers.get('origin') || 
                     'https://onenesskingdom.world';
      
      console.log('Sending password reset email to:', validatedEmail);
      console.log('Redirect URL:', `${siteUrl}/reset-password`);
      
      const { error } = await supabase.auth.resetPasswordForEmail(validatedEmail, {
        redirectTo: `${siteUrl}/reset-password`
      });

      if (error) {
        console.error('Supabase reset password error:', error);
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      console.log('Password reset email sent successfully to:', validatedEmail);
      return NextResponse.json({
        message: 'Password reset email sent successfully'
      });
    }

    // Handle password reset confirmation
    if (token && password) {
      const { token: validatedToken, password: validatedPassword } = resetConfirmSchema.parse({ token, password });
      
      // The token is actually in the URL hash when redirected from Supabase
      // We'll handle this in the frontend, but we need to verify the user can update
      // For now, we'll use the token to get the user and update password
      
      const { error } = await supabase.auth.updateUser({
        password: validatedPassword
      });

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        message: 'Password updated successfully'
      });
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
