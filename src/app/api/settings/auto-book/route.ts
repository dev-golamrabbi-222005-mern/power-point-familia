import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth.js';
import { getDb, saveDb, ensureDbInit } from '@/src/lib/db.js';

// GET: Check if current user has auto-book disabled
export async function GET(req: NextRequest) {
  try {
    const { error, user } = authenticate(req);
    if (error) return error;

    await ensureDbInit();
    const db = getDb();
    const dbUser = db.users.find(u => u.id === user.id);
    
    return NextResponse.json({ 
      autoBookDisabled: dbUser?.autoBookDisabled ?? false 
    });
  } catch (error) {
    console.error('Fetch auto-book preference error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

// PUT: Toggle auto-book opt-out for the current member
export async function PUT(req: NextRequest) {
  try {
    const { error, user } = authenticate(req, ['member']);
    if (error) return error;

    const { autoBookDisabled } = await req.json();

    await ensureDbInit();
    const db = getDb();
    const userIndex = db.users.findIndex(u => u.id === user.id);
    
    if (userIndex === -1) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    db.users[userIndex].autoBookDisabled = Boolean(autoBookDisabled);
    saveDb(db);

    return NextResponse.json({ 
      autoBookDisabled: db.users[userIndex].autoBookDisabled,
      message: Boolean(autoBookDisabled) 
        ? 'Auto-booking disabled. You will not be automatically booked for new menus.'
        : 'Auto-booking enabled. You will be automatically booked for new menus.'
    });
  } catch (error) {
    console.error('Toggle auto-book preference error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
