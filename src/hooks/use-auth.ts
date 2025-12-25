'use client';

import { useEffect, useState } from 'react';
import { isAuthenticated, getCurrentUser } from '@/lib/auth';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for regular authentication first
        const currentUser = getCurrentUser();
        const authenticated = currentUser ? await isAuthenticated() : false;

        if (authenticated) {
          setIsLoggedIn(true);
          setUser(currentUser);
          setLoading(false);
          return;
        }

        // If not authenticated, try guest login
        await initGuest();
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsLoggedIn(false);
        setUser(null);
        setLoading(false);
      }
    };

    const initGuest = async () => {
      try {
        const storedGuestUserId = localStorage.getItem('guest_user_id');

        const initResponse = await fetch('/api/guest/init', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ guestUserId: storedGuestUserId || undefined }),
        });

        const initData = await initResponse.json();
        if (!initResponse.ok) {
          throw new Error(initData?.error || 'Failed to init guest user');
        }

        const guestUserId: string | undefined = initData?.guestUserId;
        if (!guestUserId) {
          throw new Error('Guest user id missing from init response');
        }

        localStorage.setItem('guest_user_id', guestUserId);

        const profileResponse = await fetch('/api/profile', {
          headers: {
            'x-guest-user-id': guestUserId,
          },
        });

        if (!profileResponse.ok) {
          const errData = await profileResponse.json().catch(() => ({}));
          throw new Error(errData?.error || 'Failed to load guest profile');
        }

        const profileData = await profileResponse.json();
        const profile = profileData?.profile;

        setUser({
          id: profile?.id || guestUserId,
          email: profile?.email || 'guest@oneness.local',
          profile: {
            display_name: profile?.name || 'ゲスト',
            avatar_url: profile?.avatarUrl,
            banner_url: profile?.bannerUrl,
            bio: profile?.bio,
          },
          points: {
            total: profile?.op_balance ?? 0,
          },
        });
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Guest init failed:', error);
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Listen for storage changes (in case another tab logs out)
    const handleStorageChange = () => {
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsLoggedIn(true);
      } else {
        // If user was logged in and now isn't, re-check auth
        if (isLoggedIn) {
          checkAuth();
        }
      }
    };

    // Initial auth check
    checkAuth();

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isLoggedIn]);

  return { isLoggedIn, user, loading };
};
