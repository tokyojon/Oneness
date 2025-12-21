'use client';

import { useEffect, useState } from 'react';
import { isAuthenticated, getCurrentUser } from '@/lib/auth';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

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
  }, []);

  return { isLoggedIn, user, loading };
};
