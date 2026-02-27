'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { TaskForm } from '@/components/tasks/TaskForm';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { Task } from '@/types';

interface TaskPayload {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  due_date?: string;
  tags?: string[];
  is_private?: boolean;
}

export default function NewTaskPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (values: {
    title: string;
    description: string;
    status: string;
    priority: string;
    dueDate: string;
    tags: string;
    isPrivate: boolean;
  }) => {
    setLoading(true);
    const payload: TaskPayload = {
      title: values.title,
      description: values.description || undefined,
      priority: values.priority,
      due_date: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
      tags: values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined,
      is_private: values.isPrivate
    };

    const response = await api.post<Task>('/api/tasks', payload);
    if (response.error || !response.data) {
      toast(response.error || 'Unable to create task.', 'error');
      setLoading(false);
      return;
    }
    toast('Task created!', 'success');
    router.push(`/tasks/${response.data.id}`);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Create Task</h1>
          <p className="text-secondary">Add a new task to your list.</p>
        </div>
        <Button variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
      <TaskForm onSubmit={handleSubmit} loading={loading} submitLabel="Create Task" showStatus={false} />
    </div>
  );
}
