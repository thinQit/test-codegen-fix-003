import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      success: true,
      data: { status: 'ok', timestamp: new Date().toISOString(), db: 'ok' }
    });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Database unreachable'
    }, { status: 500 });
  }
}
