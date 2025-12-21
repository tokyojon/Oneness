'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { logout } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function TestAuthPage() {
  const { isLoggedIn, user, loading } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
      
      <div className="mb-4">
        <p><strong>Authentication Status:</strong> {isLoggedIn ? 'Logged In' : 'Not Logged In'}</p>
        {user && (
          <div>
            <p><strong>User:</strong> {user.displayName || user.email}</p>
          </div>
        )}
      </div>
      
      {isLoggedIn ? (
        <Button onClick={handleLogout}>Logout</Button>
      ) : (
        <Button onClick={() => router.push('/login')}>Login</Button>
      )}
    </div>
  );
}
