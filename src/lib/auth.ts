// Authentication utility functions using API calls and cookies for tokens, localStorage for user data only

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/auth/me');
    return response.ok;
  } catch {
    return false;
  }
};

export const login = (user: any): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const logout = async (): Promise<void> => {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch (error) {
    console.error('Logout error:', error);
  }
  localStorage.removeItem('user');
};

export const getCurrentUser = (): any => {
  if (typeof window === 'undefined') return null;
  
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
