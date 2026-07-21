import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth.js';
import { getDb, ensureDbInit } from '@/src/lib/db.js';

export async function GET(req: NextRequest) {
  try {
    const { error } = authenticate(req, ['manager', 'admin']);
    if (error) return error;

    await ensureDbInit();
    const db = getDb();
    
    // Don't expose password hash
    const sanitizedUsers = db.users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      phone: u.phone,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt
    }));

    return NextResponse.json(sanitizedUsers);
  } catch (error) {
    console.error('Fetch members error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
