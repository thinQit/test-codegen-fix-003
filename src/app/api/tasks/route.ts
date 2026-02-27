import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  due_date: z.string().datetime().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
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

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') || 10)));
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const dueBefore = searchParams.get('dueBefore');
    const q = searchParams.get('q');

    const where = {
      userId: payload.sub,
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
      ...(dueBefore ? { dueDate: { lt: new Date(dueBefore) } } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' as const } },
              { description: { contains: q, mode: 'insensitive' as const } }
            ]
          }
        : {})
    };

    const [total, items] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: items.map((task) => ({
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
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit))
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch tasks';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message || 'Invalid data' }, { status: 400 });
    }

    const { title, description, due_date, priority, tags, is_private } = parsed.data;

    const task = await prisma.task.create({
      data: {
        userId: payload.sub,
        title,
        description,
        dueDate: due_date ? new Date(due_date) : undefined,
        priority: priority || 'medium',
        tags: JSON.stringify(tags || []),
        isPrivate: is_private ?? false
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
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create task';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
