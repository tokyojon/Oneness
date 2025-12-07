// Authentication utility functions using API calls and cookies for tokens, localStorage for user data only

export const isAuthenticated = async (): Promise<{ authenticated: boolean; user?: any }> => {
  try {
    const response = await fetch('/api/auth/me');
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
