import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth';
import { getDb, ensureDbInit } from '@/src/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { error, user } = authenticate(req);
    if (error) return error;

    await ensureDbInit();
    const db = getDb();
    const fullUser = db.users.find(u => u.id === user!.id);

    if (!fullUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: fullUser.id,
        email: fullUser.email,
        name: fullUser.name,
        phone: fullUser.phone,
        role: fullUser.role,
        status: fullUser.status,
        createdAt: fullUser.createdAt
      }
    });
  } catch (error) {
    console.error('Auth me error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
