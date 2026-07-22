import { NextRequest, NextResponse } from 'next/server';
import { getDb, ensureDbInit } from '@/src/lib/db.js';

// Public endpoint — no auth required
// Returns aggregated calendar data for the homepage
export async function GET(req: NextRequest) {
  try {
    await ensureDbInit();
    const db = getDb();

    // Resolve user names for bazaar assignments
    const assignments = db.bazaarAssignments.map(a => {
      const u = db.users.find(usr => usr.id === a.userId);
      return { ...a, userName: u ? u.name : 'Unknown' };
    });

    // Resolve user names for bazaar expenses
    const expenses = db.bazaarExpenses.map(e => {
      const u = db.users.find(usr => usr.id === e.userId);
      return { ...e, userName: u ? u.name : 'Unknown' };
    });

    // Resolve member names for pair display
    const pairs = db.bazaarPairs.map(p => {
      const m1 = db.users.find(u => u.id === p.member1Id);
      const m2 = db.users.find(u => u.id === p.member2Id);
      return {
        ...p,
        member1Name: m1 ? m1.name : 'Unknown',
        member2Name: m2 ? m2.name : 'Unknown',
      };
    });

    // Aggregated meal counts by date & mealType (no user IDs — privacy safe)
    const mealCounts: Record<string, { lunch: number; dinner: number }> = {};
    for (const rec of db.records) {
      if (!mealCounts[rec.date]) {
        mealCounts[rec.date] = { lunch: 0, dinner: 0 };
      }
      if (rec.mealType === 'lunch') {
        mealCounts[rec.date].lunch += rec.count;
      } else if (rec.mealType === 'dinner') {
        mealCounts[rec.date].dinner += rec.count;
      }
    }

    // Also include per-user meal breakdown per date for logged-in views
    // For public, only return aggregated counts
    const mealSummary = Object.entries(mealCounts).map(([date, counts]) => ({
      date,
      ...counts,
    }));

    // Current bazaar pair info
    let currentPair = null;
    let nextPair = null;
    if (pairs.length > 0) {
      const currentIdx = db.settings.currentPairIndex % pairs.length;
      currentPair = pairs[currentIdx];
      if (pairs.length > 1) {
        const nextIdx = (currentIdx + 1) % pairs.length;
        nextPair = pairs[nextIdx];
      }
    }

    return NextResponse.json({
      menus: db.menus,
      assignments,
      expenses,
      pairs,
      mealSummary,
      currentPair,
      nextPair,
      currentPairIndex: db.settings.currentPairIndex,
    });
  } catch (error) {
    console.error('Public calendar error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
