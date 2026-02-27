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

interface RegisterResponse {
  user: User;
  token: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, login, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [formState, setFormState] = useState({ name: '', email: '', password: '' });
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
    const response = await api.post<RegisterResponse>('/api/auth/register', formState);
    if (response.error || !response.data) {
      setError(response.error || 'Unable to register.');
      setLoading(false);
      return;
    }
    localStorage.setItem('token', response.data.token);
    login(response.data.user);
    toast('Account created successfully!', 'success');
    router.push('/');
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold text-foreground">Create account</h1>
          <p className="text-sm text-secondary">Start managing your tasks today.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              required
              value={formState.name}
              onChange={event => setFormState(prev => ({ ...prev, name: event.target.value }))}
            />
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
              helperText="Use at least 8 characters."
            />
            {error && <p className="text-sm text-error">{error}</p>}
            <Button type="submit" loading={loading} fullWidth>
              Create account
            </Button>
          </form>
          <p className="mt-4 text-sm text-secondary">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
