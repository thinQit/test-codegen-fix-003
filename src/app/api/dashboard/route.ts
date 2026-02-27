import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

function parseTags(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    const { searchParams } = new URL(request.url);
    const period = Number(searchParams.get('period') || 7);
    const since = new Date(Date.now() - period * 24 * 60 * 60 * 1000);
    const dueSoonDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const [totalTasks, todoCount, inProgressCount, doneCount, dueSoon, recentTasks] = await Promise.all([
      prisma.task.count({ where: { userId: payload.sub } }),
      prisma.task.count({ where: { userId: payload.sub, status: 'todo' } }),
      prisma.task.count({ where: { userId: payload.sub, status: 'in_progress' } }),
      prisma.task.count({ where: { userId: payload.sub, status: 'done' } }),
      prisma.task.findMany({
        where: { userId: payload.sub, dueDate: { lte: dueSoonDate } },
        orderBy: { dueDate: 'asc' },
        take: 5
      }),
      prisma.task.findMany({
        where: { userId: payload.sub, createdAt: { gte: since } },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalTasks,
        byStatus: {
          todo: todoCount,
          in_progress: inProgressCount,
          done: doneCount
        },
        dueSoon: dueSoon.map((task) => ({
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
        })),
        recentTasks: recentTasks.map((task) => ({
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
        }))
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch dashboard';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
