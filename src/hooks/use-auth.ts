'use client';

import { useEffect, useState } from 'react';
<<<<<<< HEAD
import { isAuthenticated, getCurrentUser } from '@/lib/auth';
=======
>>>>>>> 27f513108b8ea2cfb0d05b37f9cb2fdd04931371

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
<<<<<<< HEAD
    // Check authentication status
    const checkAuth = async () => {
      try {
        // Optimize: Check local storage first to avoid unnecessary API calls
        // This prevents 401 errors in console for non-logged in users
        const currentUser = getCurrentUser();
        
        if (!currentUser) {
          setIsLoggedIn(false);
          setUser(null);
          setLoading(false);
          return;
        }

        const authenticated = await isAuthenticated();

        if (!authenticated) {
          // If API check fails (e.g. session expired), clear local state
          setIsLoggedIn(false);
          setUser(null);
        } else {
          setIsLoggedIn(true);
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
=======
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
>>>>>>> 27f513108b8ea2cfb0d05b37f9cb2fdd04931371
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

<<<<<<< HEAD
    checkAuth();

    // Listen for storage changes (in case another tab logs out)
    const handleStorageChange = () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      // For login status, we might need to re-check API
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
=======
    initGuest();
>>>>>>> 27f513108b8ea2cfb0d05b37f9cb2fdd04931371
  }, []);

  return { isLoggedIn, user, loading };
};
