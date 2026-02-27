'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { api } from '@/lib/api';
import { User } from '@/types';

interface LoginResponse {
  user: User;
  token: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, login, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [formState, setFormState] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const response = await api.post<LoginResponse>('/api/auth/login', formState);
    if (response.error || !response.data) {
      setError(response.error || 'Unable to login.');
      setLoading(false);
      return;
    }
    localStorage.setItem('token', response.data.token);
    login(response.data.user);
    toast('Welcome back!', 'success');
    router.push('/');
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold text-foreground">Sign in</h1>
          <p className="text-sm text-secondary">Access your task dashboard.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              name="email"
              type="email"
              required
              value={formState.email}
              onChange={event => setFormState(prev => ({ ...prev, email: event.target.value }))}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              required
              value={formState.password}
              onChange={event => setFormState(prev => ({ ...prev, password: event.target.value }))}
            />
            {error && <p className="text-sm text-error">{error}</p>}
            <Button type="submit" loading={loading} fullWidth>
              Sign in
            </Button>
          </form>
          <p className="mt-4 text-sm text-secondary">
            No account?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
