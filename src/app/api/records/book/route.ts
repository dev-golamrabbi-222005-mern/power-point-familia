import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth.js';
import { getDb, saveDb, ensureDbInit } from '@/src/lib/db.js';
import { MealRecord } from '@/src/types';

export async function POST(req: NextRequest) {
  try {
    const { error, user } = authenticate(req, ['member', 'manager', 'admin']);
    if (error) return error;

    const { date, mealType, count, userId: targetUserId } = await req.json();

    if (!date || !mealType || count === undefined) {
      return NextResponse.json(
        { message: 'date, mealType, and count are required.' },
        { status: 400 }
      );
    }

    if (Number(count) < 0 || Number(count) > 5) {
      return NextResponse.json(
        { message: 'Meal count must be between 0 and 5.' },
        { status: 400 }
      );
    }

    await ensureDbInit();
    const db = getDb();
    
    // Determine whose meal is being booked (managers/admins can book on behalf of anyone)
    let finalUserId = user!.id;
    if (targetUserId && (user!.role === 'manager' || user!.role === 'admin')) {
      finalUserId = targetUserId;
    }

    const recordIndex = db.records.findIndex(r => r.userId === finalUserId && r.date === date && r.mealType === mealType);

    if (recordIndex !== -1) {
      if (Number(count) === 0) {
        // Remove if set to 0
        db.records.splice(recordIndex, 1);
        saveDb(db);
        return NextResponse.json({ message: 'Meal booking removed.' });
      } else {
        db.records[recordIndex].count = Number(count);
        saveDb(db);
        return NextResponse.json({ record: db.records[recordIndex], message: 'Meal booking updated.' });
      }
    } else {
      if (Number(count) > 0) {
        const newRecord: MealRecord = {
          id: `rec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          userId: finalUserId,
          date,
          mealType,
          count: Number(count),
        };
        db.records.push(newRecord);
        saveDb(db);
        return NextResponse.json({ record: newRecord, message: 'Meal booked successfully.' }, { status: 201 });
      } else {
        return NextResponse.json({ message: 'Nothing to book.' });
      }
    }
  } catch (error) {
    console.error('Book meal error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
