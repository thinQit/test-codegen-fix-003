import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    const sessions = await prisma.authSession.findMany({
      where: { userId: payload.sub },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: sessions.map((session) => ({
        id: session.id,
        token: session.token,
        expiresAt: session.expiresAt.toISOString(),
        userId: session.userId,
        createdAt: session.createdAt.toISOString()
      }))
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch sessions';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
