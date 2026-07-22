import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth';
import { getDb, saveDb, ensureDbInit } from '@/src/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { error, user } = authenticate(req);
    if (error) return error;

    const subscription = await req.json();
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ message: 'Invalid subscription object.' }, { status: 400 });
    }

    await ensureDbInit();
    const db = getDb();
    const userIndex = db.users.findIndex(u => u.id === user!.id);

    if (userIndex === -1) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    const currentSubs = db.users[userIndex].pushSubscriptions || [];
    const exists = currentSubs.some(s => s.endpoint === subscription.endpoint);

    if (!exists) {
      db.users[userIndex].pushSubscriptions = [...currentSubs, subscription];
      saveDb(db);
    }

    return NextResponse.json({ message: 'Push notification subscription saved.' });
  } catch (err) {
    console.error('Subscription error', err);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
