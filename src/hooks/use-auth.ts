'use client';

import { useEffect, useState } from 'react';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    initGuest();
  }, []);

  return { isLoggedIn, user, loading };
};
