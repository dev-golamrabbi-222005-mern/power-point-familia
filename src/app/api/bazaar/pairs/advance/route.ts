import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth.js';
import { getDb, saveDb, ensureDbInit } from '@/src/lib/db.js';

// POST: Advance to the next pair in the rotation
export async function POST(req: NextRequest) {
  try {
    const { error } = authenticate(req, ['manager', 'admin']);
    if (error) return error;

    await ensureDbInit();
    const db = getDb();

    if (db.bazaarPairs.length === 0) {
      return NextResponse.json({ message: 'No pairs exist in the rotation.' }, { status: 400 });
    }

    // Advance to next pair
    const oldIndex = db.settings.currentPairIndex;
    db.settings.currentPairIndex = (oldIndex + 1) % db.bazaarPairs.length;
    
    saveDb(db);

    const currentPair = db.bazaarPairs[db.settings.currentPairIndex];
    const m1 = db.users.find(u => u.id === currentPair.member1Id);
    const m2 = db.users.find(u => u.id === currentPair.member2Id);

    return NextResponse.json({
      message: `Advanced from pair #${oldIndex + 1} to pair #${db.settings.currentPairIndex + 1}`,
      previousPairIndex: oldIndex,
      currentPairIndex: db.settings.currentPairIndex,
      currentPair: {
        ...currentPair,
        member1Name: m1?.name || 'Unknown',
        member2Name: m2?.name || 'Unknown',
      },
    });
  } catch (error) {
    console.error('Advance pair error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
