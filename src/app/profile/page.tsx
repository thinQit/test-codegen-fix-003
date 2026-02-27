'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { User } from '@/types';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, user: authUser, logout } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      const response = await api.get<User>('/api/auth/me');
      if (response.error || !response.data) {
        setError(response.error || 'Unable to load profile.');
        setUser(null);
      } else {
        setUser(response.data);
      }
      setLoading(false);
    };

    if (!authLoading && isAuthenticated) {
      loadProfile();
    }
  }, [authLoading, isAuthenticated]);

  const handleLogout = async () => {
    await api.post<null>('/api/auth/logout', {});
    logout();
    toast('You have been logged out.', 'success');
    router.push('/login');
  };

  if (loading || authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-2xl font-semibold">Unable to load profile</h1>
        <p className="text-secondary">{error}</p>
        <Button onClick={() => location.reload()}>Retry</Button>
      </div>
    );
  }

  const profile = user || authUser;

  if (!profile) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-2xl font-semibold">Profile unavailable</h1>
        <p className="text-secondary">We could not find your account information.</p>
        <Button onClick={() => router.push('/')}>Go to dashboard</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Profile</h1>
        <p className="text-secondary">Manage your account details.</p>
      </div>
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-foreground">Account Details</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-secondary">Name</p>
            <p className="font-medium text-foreground">{profile.name}</p>
          </div>
          <div>
            <p className="text-sm text-secondary">Email</p>
            <p className="font-medium text-foreground">{profile.email}</p>
          </div>
          <div>
            <p className="text-sm text-secondary">Joined</p>
            <p className="font-medium text-foreground">
              {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={() => router.push('/tasks')}>
          View Tasks
        </Button>
        <Button variant="destructive" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
}
