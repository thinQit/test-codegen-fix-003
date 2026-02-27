import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  due_date: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  is_private: z.boolean().optional()
});

function parseTags(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    const task = await prisma.task.findUnique({ where: { id: params.id } });

    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    if (task.userId !== payload.sub) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: task.id,
        userId: task.userId,
        title: task.title,
        description: task.description || undefined,
        status: task.status,
        priority: task.priority,
        tags: parseTags(task.tags),
        dueDate: task.dueDate?.toISOString(),
        completedAt: task.completedAt?.toISOString(),
        isPrivate: task.isPrivate,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString()
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch task';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    const body = await request.json();
    const parsed = updateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message || 'Invalid data' }, { status: 400 });
    }

    const existing = await prisma.task.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    if (existing.userId !== payload.sub) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { title, description, status, priority, due_date, tags, is_private } = parsed.data;
    const completedAt = status === 'done' ? new Date() : undefined;

    const task = await prisma.task.update({
      where: { id: params.id },
      data: {
        title,
        description,
        status,
        priority,
        dueDate: due_date ? new Date(due_date) : undefined,
        tags: tags ? JSON.stringify(tags) : undefined,
        isPrivate: is_private,
        completedAt: completedAt ?? (status ? null : undefined)
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: task.id,
        userId: task.userId,
        title: task.title,
        description: task.description || undefined,
        status: task.status,
        priority: task.priority,
        tags: parseTags(task.tags),
        dueDate: task.dueDate?.toISOString(),
        completedAt: task.completedAt?.toISOString(),
        isPrivate: task.isPrivate,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString()
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update task';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    const task = await prisma.task.findUnique({ where: { id: params.id } });

    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    if (task.userId !== payload.sub) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    await prisma.task.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, data: { id: params.id } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete task';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
