'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { DashboardMetrics, Task } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const loadMetrics = async () => {
      setLoading(true);
      setError(null);
      const response = await api.get<DashboardMetrics>('/api/dashboard');
      if (response.error) {
        setError(response.error);
        setMetrics(null);
      } else {
        setMetrics(response.data);
      }
      setLoading(false);
    };

    if (!authLoading && isAuthenticated) {
      loadMetrics();
    }
  }, [authLoading, isAuthenticated]);

  const renderTaskList = (tasks: Task[], emptyMessage: string) => {
    if (!tasks.length) {
      return <p className="text-sm text-secondary">{emptyMessage}</p>;
    }
    return (
      <ul className="space-y-3">
        {tasks.map(task => (
          <li key={task.id} className="rounded-md border border-border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium text-foreground">{task.title}</p>
                <p className="text-xs text-secondary">
                  Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <Badge variant={task.status === 'done' ? 'success' : task.status === 'in_progress' ? 'warning' : 'default'}>
                {task.status.replace('_', ' ')}
              </Badge>
            </div>
          </li>
        ))}
      </ul>
    );
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
        <h1 className="text-2xl font-semibold">Unable to load dashboard</h1>
        <p className="text-secondary">{error}</p>
        <Button onClick={() => location.reload()}>Retry</Button>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-2xl font-semibold">No dashboard data</h1>
        <p className="text-secondary">Get started by creating your first task.</p>
        <Link href="/tasks/new">
          <Button>Create Task</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-secondary">Overview of your tasks and progress.</p>
        </div>
        <Link href="/tasks/new">
          <Button>Create Task</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <p className="text-sm text-secondary">Total Tasks</p>
            <h2 className="text-2xl font-semibold text-foreground">{metrics.totalTasks}</h2>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <p className="text-sm text-secondary">In Progress</p>
            <h2 className="text-2xl font-semibold text-foreground">{metrics.byStatus.in_progress}</h2>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <p className="text-sm text-secondary">Completed</p>
            <h2 className="text-2xl font-semibold text-foreground">{metrics.byStatus.done}</h2>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-foreground">Due Soon</h2>
          </CardHeader>
          <CardContent>{renderTaskList(metrics.dueSoon, 'No upcoming tasks due soon.')}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-foreground">Recent Tasks</h2>
          </CardHeader>
          <CardContent>{renderTaskList(metrics.recentTasks, 'No recent tasks to show.')}</CardContent>
        </Card>
      </div>
    </div>
  );
}
