import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    const session = await prisma.authSession.findUnique({ where: { id: params.id } });

    if (!session || session.userId !== payload.sub) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: session.id,
        token: session.token,
        expiresAt: session.expiresAt.toISOString(),
        userId: session.userId,
        createdAt: session.createdAt.toISOString()
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch session';
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
    const session = await prisma.authSession.findUnique({ where: { id: params.id } });

    if (!session || session.userId !== payload.sub) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    await prisma.authSession.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, data: { id: params.id } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete session';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
