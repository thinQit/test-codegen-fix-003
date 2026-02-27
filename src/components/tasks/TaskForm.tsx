'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card';
import { Task, TaskPriority, TaskStatus } from '@/types';

interface TaskFormValues {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  tags: string;
  isPrivate: boolean;
}

interface TaskFormProps {
  initial?: Task | null;
  loading?: boolean;
  onSubmit: (values: TaskFormValues) => void;
  submitLabel?: string;
  showStatus?: boolean;
}

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' }
];

const priorityOptions: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

export function TaskForm({ initial, loading, onSubmit, submitLabel = 'Save Task', showStatus = true }: TaskFormProps) {
  const [values, setValues] = useState<TaskFormValues>({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    status: initial?.status ?? 'todo',
    priority: initial?.priority ?? 'medium',
    dueDate: initial?.dueDate ? initial.dueDate.slice(0, 10) : '',
    tags: initial?.tags?.join(', ') ?? '',
    isPrivate: initial?.isPrivate ?? false
  });

  const handleChange = (field: keyof TaskFormValues, value: string | boolean) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-foreground">Task Details</h2>
      </CardHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <CardContent className="space-y-4">
          <Input
            label="Title"
            name="title"
            required
            value={values.title}
            onChange={event => handleChange('title', event.target.value)}
            placeholder="Enter task title"
          />
          <div className="space-y-1">
            <label htmlFor="description" className="block text-sm font-medium text-foreground">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
              value={values.description}
              onChange={event => handleChange('description', event.target.value)}
              placeholder="Add more context about this task"
            />
          </div>
          {showStatus && (
            <div className="space-y-1">
              <label htmlFor="status" className="block text-sm font-medium text-foreground">
                Status
              </label>
              <select
                id="status"
                name="status"
                className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                value={values.status}
                onChange={event => handleChange('status', event.target.value as TaskStatus)}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="space-y-1">
            <label htmlFor="priority" className="block text-sm font-medium text-foreground">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
              value={values.priority}
              onChange={event => handleChange('priority', event.target.value as TaskPriority)}
            >
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Due Date"
            name="dueDate"
            type="date"
            value={values.dueDate}
            onChange={event => handleChange('dueDate', event.target.value)}
            helperText="Leave blank if there is no due date"
          />
          <Input
            label="Tags"
            name="tags"
            value={values.tags}
            onChange={event => handleChange('tags', event.target.value)}
            helperText="Separate tags with commas"
            placeholder="planning, client, urgent"
          />
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              checked={values.isPrivate}
              onChange={event => handleChange('isPrivate', event.target.checked)}
            />
            Make task private
          </label>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" loading={loading} disabled={loading}>
            {submitLabel}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default TaskForm;
