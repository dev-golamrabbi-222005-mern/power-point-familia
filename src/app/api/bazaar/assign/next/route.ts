import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth.js';
import { getDb, ensureDbInit } from '@/src/lib/db.js';

// GET: Return bazaar pair rotation info
export async function GET(req: NextRequest) {
  try {
    const { error } = authenticate(req);
    if (error) return error;

    await ensureDbInit();
    const db = getDb();

    // Enrich pairs with member names
    const enrichedPairs = db.bazaarPairs
      .filter(p => p.isActive)
      .map(p => {
        const m1 = db.users.find(u => u.id === p.member1Id);
        const m2 = db.users.find(u => u.id === p.member2Id);
        return {
          ...p,
          member1Name: m1 ? m1.name : 'Unknown',
          member2Name: m2 ? m2.name : 'Unknown',
        };
      });

    const currentPairIndex = db.settings.currentPairIndex || 0;
    const totalPairs = enrichedPairs.length;

    return NextResponse.json({
      pairs: enrichedPairs,
      currentPairIndex,
      totalPairs,
      currentPair: enrichedPairs.length > 0 ? enrichedPairs[currentPairIndex % enrichedPairs.length] : null,
      nextPair: enrichedPairs.length > 1 ? enrichedPairs[(currentPairIndex + 1) % enrichedPairs.length] : null,
    });
  } catch (error) {
    console.error('Bazaar rotation fetch error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
