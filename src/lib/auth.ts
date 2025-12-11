// Authentication utility functions using API calls and cookies for tokens, localStorage for user data only

import { supabase } from '@/lib/supabase';

export const isAuthenticated = async (): Promise<{ authenticated: boolean; user?: any }> => {
  try {
    let token: string | undefined;

    // Try to get session from Supabase SDK first (handles refresh automatically)
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      token = session.access_token;
    }

    // Fallback to manual token from localStorage if SDK has no session
    if (!token) {
      token = localStorage.getItem('auth_token') || undefined;
    }

    // Also try to find Supabase token if custom token is missing
    if (!token) {
      // Simple heuristic to find sb-*-auth-token
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('sb-') && key?.endsWith('-auth-token')) {
          const sessionStr = localStorage.getItem(key);
          if (sessionStr) {
            try {
              const session = JSON.parse(sessionStr);
              if (session.access_token) {
                token = session.access_token;
                break;
              }
            } catch (e) { /* ignore */ }
          }
        }
      }
    }

    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('/api/auth/me', { headers });
    if (response.ok) {
      const data = await response.json();
      return { authenticated: true, user: data.user };
    }
    return { authenticated: false };
  } catch {
    return { authenticated: false };
  }
};

export const login = (user: any): void => {
  localStorage.setItem('user', JSON.stringify(user));
  // Dispatch storage event to notify other tabs/components
  window.dispatchEvent(new Event('storage'));
};

export const refreshSession = async (): Promise<any> => {
  try {
    const { authenticated, user } = await isAuthenticated();
    if (authenticated && user) {
      localStorage.setItem('user', JSON.stringify(user));
      // Dispatch storage event to notify other tabs/components
      window.dispatchEvent(new Event('storage'));
      return user;
    }
    return null;
  } catch (error) {
    console.error('Failed to refresh session:', error);
    return null;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch (error) {
    console.error('Logout error:', error);
  }
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('storage'));
};

export const getCurrentUser = (): any => {
  if (typeof window === 'undefined') return null;

  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
