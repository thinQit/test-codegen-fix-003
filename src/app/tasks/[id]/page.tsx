'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { TaskForm } from '@/components/tasks/TaskForm';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { Task } from '@/types';

interface TaskPayload {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  due_date?: string;
  tags?: string[];
  is_private?: boolean;
}

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const taskId = params?.id as string;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const loadTask = async () => {
      setLoading(true);
      setError(null);
      const response = await api.get<Task>(`/api/tasks/${taskId}`);
      if (response.error || !response.data) {
        setError(response.error || 'Unable to load task.');
        setTask(null);
      } else {
        setTask(response.data);
      }
      setLoading(false);
    };

    if (!authLoading && isAuthenticated && taskId) {
      loadTask();
    }
  }, [authLoading, isAuthenticated, taskId]);

  const handleUpdate = async (values: {
    title: string;
    description: string;
    status: string;
    priority: string;
    dueDate: string;
    tags: string;
    isPrivate: boolean;
  }) => {
    if (!taskId) return;
    setSaving(true);
    const payload: TaskPayload = {
      title: values.title,
      description: values.description || undefined,
      status: values.status,
      priority: values.priority,
      due_date: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
      tags: values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined,
      is_private: values.isPrivate
    };
    const response = await api.put<Task>(`/api/tasks/${taskId}`, payload);
    if (response.error || !response.data) {
      toast(response.error || 'Unable to update task.', 'error');
      setSaving(false);
      return;
    }
    setTask(response.data);
    toast('Task updated.', 'success');
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!taskId) return;
    setSaving(true);
    const response = await api.delete<null>(`/api/tasks/${taskId}`);
    if (response.error) {
      toast(response.error || 'Unable to delete task.', 'error');
      setSaving(false);
      setDeleteOpen(false);
      return;
    }
    toast('Task deleted.', 'success');
    router.push('/tasks');
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
        <h1 className="text-2xl font-semibold">Task not available</h1>
        <p className="text-secondary">{error}</p>
        <Link href="/tasks">
          <Button>Back to tasks</Button>
        </Link>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-2xl font-semibold">Task not found</h1>
        <p className="text-secondary">This task no longer exists.</p>
        <Link href="/tasks">
          <Button>Back to tasks</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Edit Task</h1>
          <p className="text-secondary">Update task details and status.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            Delete
          </Button>
        </div>
      </div>

      <TaskForm initial={task} onSubmit={handleUpdate} loading={saving} submitLabel="Save Changes" />

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete task?">
        <p className="text-sm text-secondary">This action cannot be undone. Are you sure you want to delete this task?</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" loading={saving} onClick={handleDelete}>
            Confirm Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
