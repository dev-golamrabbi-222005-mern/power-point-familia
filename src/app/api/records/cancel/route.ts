import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth';
import { getDb, saveDb, ensureDbInit } from '@/src/lib/db';
import { getDhakaTime } from '@/src/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const { error, user } = authenticate(req, ['member', 'manager', 'admin']);
    if (error) return error;

    const { slots, targetUserId } = await req.json();
    // slots: [{ date: 'YYYY-MM-DD', mealType: 'lunch' | 'dinner' }]

    if (!slots || !Array.isArray(slots) || slots.length === 0) {
      return NextResponse.json(
        { message: 'Provide at least one meal slot to cancel.' },
        { status: 400 }
      );
    }

    // Validate each slot
    for (const slot of slots) {
      if (!slot.date || !slot.mealType || !['lunch', 'dinner'].includes(slot.mealType)) {
        return NextResponse.json(
          { message: 'Each slot must have a valid date and mealType (lunch/dinner).' },
          { status: 400 }
        );
      }
    }

    await ensureDbInit();
    const db = getDb();

    // Determine whose meals to cancel
    let finalUserId = user!.id;
    if (targetUserId && (user!.role === 'manager' || user!.role === 'admin')) {
      finalUserId = targetUserId;
    }

    const { today, currentHour } = getDhakaTime();

    // Check cut-off time for members
    if (user!.role === 'member') {
      for (const slot of slots) {
        if (slot.date === today) {
          if (slot.mealType === 'lunch' && currentHour >= 9) {
            return NextResponse.json({
              message: 'Lunch cut-off time (09:00 AM) has passed. Please submit an emergency meal-off request.',
              cutoffPassed: true,
            }, { status: 400 });
          }
          if (slot.mealType === 'dinner' && currentHour >= 15) {
            return NextResponse.json({
              message: 'Dinner cut-off time (03:00 PM) has passed. Please submit an emergency meal-off request.',
              cutoffPassed: true,
            }, { status: 400 });
          }
        }
      }
    }

    let cancelledCount = 0;

    for (const slot of slots) {
      const recordIndex = db.records.findIndex(
        r => r.userId === finalUserId && r.date === slot.date && r.mealType === slot.mealType
      );

      if (recordIndex !== -1) {
        // Remove the record (count becomes 0 = cancelled)
        db.records.splice(recordIndex, 1);
        cancelledCount++;
      }
    }

    saveDb(db);

    return NextResponse.json({
      message: `Cancelled ${cancelledCount} meal slot(s) successfully.`,
      cancelledCount,
    });
  } catch (error) {
    console.error('Bulk cancel error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
