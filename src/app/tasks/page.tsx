'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { Task } from '@/types';

interface TaskListResponse {
  items: Task[];
  total: number;
  page: number;
  limit: number;
}

const statusOptions = [
  { value: '', label: 'All statuses' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' }
];

const priorityOptions = [
  { value: '', label: 'All priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

export default function TasksPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ q: '', status: '', priority: '', dueBefore: '' });
  const limit = 8;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    if (filters.q) params.set('q', filters.q);
    if (filters.status) params.set('status', filters.status);
    if (filters.priority) params.set('priority', filters.priority);
    if (filters.dueBefore) params.set('dueBefore', filters.dueBefore);
    return params.toString();
  }, [filters, page]);

  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true);
      setError(null);
      const response = await api.get<TaskListResponse>(`/api/tasks?${queryString}`);
      if (response.error || !response.data) {
        setError(response.error || 'Unable to load tasks.');
        setTasks([]);
        setTotal(0);
      } else {
        setTasks(response.data.items);
        setTotal(response.data.total);
      }
      setLoading(false);
    };

    if (!authLoading && isAuthenticated) {
      loadTasks();
    }
  }, [authLoading, isAuthenticated, queryString]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1);
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
        <h1 className="text-2xl font-semibold">Unable to load tasks</h1>
        <p className="text-secondary">{error}</p>
        <Button onClick={() => location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Tasks</h1>
          <p className="text-secondary">Search, filter, and manage your tasks.</p>
        </div>
        <Link href="/tasks/new">
          <Button>Create Task</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-foreground">Filters</h2>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <Input
            label="Search"
            name="q"
            value={filters.q}
            onChange={event => handleFilterChange('q', event.target.value)}
            placeholder="Search tasks"
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-foreground" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
              value={filters.status}
              onChange={event => handleFilterChange('status', event.target.value)}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-foreground" htmlFor="priority">
              Priority
            </label>
            <select
              id="priority"
              className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
              value={filters.priority}
              onChange={event => handleFilterChange('priority', event.target.value)}
            >
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Due before"
            name="dueBefore"
            type="date"
            value={filters.dueBefore}
            onChange={event => handleFilterChange('dueBefore', event.target.value)}
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {tasks.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-secondary">No tasks match these filters.</p>
            </CardContent>
          </Card>
        ) : (
          tasks.map(task => (
            <Card key={task.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <Link href={`/tasks/${task.id}`} className="text-lg font-semibold text-foreground hover:text-primary">
                    {task.title}
                  </Link>
                  <p className="text-sm text-secondary">
                    Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={task.status === 'done' ? 'success' : task.status === 'in_progress' ? 'warning' : 'default'}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                  <Badge variant={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'secondary'}>
                    {task.priority}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-secondary">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(prev => Math.max(1, prev - 1))}>
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
