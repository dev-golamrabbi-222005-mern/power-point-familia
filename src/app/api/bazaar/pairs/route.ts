import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth';
import { getDb, saveDb, ensureDbInit } from '@/src/lib/db';
import { BazaarPair } from '@/src/types';

// GET: View all bazaar pairs (visible to all authenticated users)
export async function GET(req: NextRequest) {
  try {
    const { error } = authenticate(req);
    if (error) return error;

    await ensureDbInit();
    const db = getDb();

    // Enrich with member names
    const enriched = db.bazaarPairs.map(p => {
      const m1 = db.users.find(u => u.id === p.member1Id);
      const m2 = db.users.find(u => u.id === p.member2Id);
      return {
        ...p,
        member1Name: m1 ? m1.name : 'Unknown',
        member2Name: m2 ? m2.name : 'Unknown',
      };
    });

    return NextResponse.json({
      pairs: enriched,
      currentPairIndex: db.settings.currentPairIndex,
      totalPairs: enriched.length,
      currentPair: enriched.length > 0 ? enriched[db.settings.currentPairIndex % enriched.length] : null,
    });
  } catch (error) {
    console.error('Fetch pairs error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

// POST: Create a new bazaar pair (manager/admin only)
export async function POST(req: NextRequest) {
  try {
    const { error } = authenticate(req, ['manager', 'admin']);
    if (error) return error;

    const { member1Id, member2Id } = await req.json();

    if (!member1Id || !member2Id) {
      return NextResponse.json({ message: 'Both member1Id and member2Id are required.' }, { status: 400 });
    }

    if (member1Id === member2Id) {
      return NextResponse.json({ message: 'Cannot pair a member with themselves.' }, { status: 400 });
    }

    await ensureDbInit();
    const db = getDb();

    // Check if either member is already in an active pair
    const alreadyInPair = db.bazaarPairs.some(
      p => p.isActive && (p.member1Id === member1Id || p.member2Id === member1Id || p.member1Id === member2Id || p.member2Id === member2Id)
    );
    if (alreadyInPair) {
      return NextResponse.json({ message: 'One or both members are already in an active pair.' }, { status: 400 });
    }

    const newPair: BazaarPair = {
      id: `pair-${Date.now()}`,
      member1Id,
      member2Id,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    db.bazaarPairs.push(newPair);
    saveDb(db);

    const m1 = db.users.find(u => u.id === member1Id);
    const m2 = db.users.find(u => u.id === member2Id);

    return NextResponse.json({
      pair: { ...newPair, member1Name: m1?.name, member2Name: m2?.name },
      message: `Pair created: ${m1?.name || 'Unknown'} & ${m2?.name || 'Unknown'}`
    }, { status: 201 });
  } catch (error) {
    console.error('Create pair error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

// DELETE: Remove a pair by id
export async function DELETE(req: NextRequest) {
  try {
    const { error } = authenticate(req, ['manager', 'admin']);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const pairId = searchParams.get('id');

    if (!pairId) {
      return NextResponse.json({ message: 'Pair id is required.' }, { status: 400 });
    }

    await ensureDbInit();
    const db = getDb();

    const pairIndex = db.bazaarPairs.findIndex(p => p.id === pairId);
    if (pairIndex === -1) {
      return NextResponse.json({ message: 'Pair not found.' }, { status: 404 });
    }

    db.bazaarPairs.splice(pairIndex, 1);
    
    // Reset currentPairIndex if needed
    if (db.settings.currentPairIndex >= db.bazaarPairs.length && db.bazaarPairs.length > 0) {
      db.settings.currentPairIndex = 0;
    }

    saveDb(db);

    return NextResponse.json({ message: 'Pair removed successfully.' });
  } catch (error) {
    console.error('Delete pair error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
