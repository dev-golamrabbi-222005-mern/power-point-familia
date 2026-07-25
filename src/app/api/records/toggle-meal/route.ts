import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth';
import { getDb, ensureDbInit, saveDb } from '@/src/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { error, user } = authenticate(req);
    if (error) return error;

    if (user!.role !== 'member') {
      return NextResponse.json({ message: 'Only members can toggle meals.' }, { status: 403 });
    }

    const { date, mealType, action } = await req.json(); // action: 'on' | 'off'

    if (!date || !mealType || !action) {
      return NextResponse.json({ message: 'Missing required fields: date, mealType, action.' }, { status: 400 });
    }

    if (!['lunch', 'dinner'].includes(mealType)) {
      return NextResponse.json({ message: 'Invalid mealType.' }, { status: 400 });
    }

    if (!['on', 'off'].includes(action)) {
      return NextResponse.json({ message: 'Invalid action.' }, { status: 400 });
    }

    await ensureDbInit();
    const db = getDb();

    const userId = user!.id;
    const today = new Date().toISOString().split('T')[0];
    const requestDate = new Date(date + 'T00:00:00');
    const todayDate = new Date(today + 'T00:00:00');
    const daysAhead = Math.floor((requestDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));

    // Validate: Can only turn off meals up to 3 days in advance
    if (action === 'off' && daysAhead > 3) {
      return NextResponse.json({
        message: 'Can only turn off meals up to 3 days in advance.',
        maxDaysAllowed: 3,
        daysRequested: daysAhead,
      }, { status: 400 });
    }

    // Find existing record for this user, date, mealType
    const existingRecordIndex = db.records.findIndex(
      r => r.userId === userId && r.date === date && r.mealType === mealType
    );

    const newCount = action === 'on' ? 1 : 0;
    let record;

    if (existingRecordIndex >= 0) {
      // Update existing
      record = db.records[existingRecordIndex];
      const oldCount = record.count;
      record.count = newCount;
      
      // Log the toggle action
      if (!db.mealToggleLog) db.mealToggleLog = [];
      db.mealToggleLog.push({
        id: `log-${Date.now()}-${Math.random()}`,
        userId,
        date,
        mealType,
        action,
        oldCount,
        newCount,
        timestamp: new Date().toISOString(),
      });
    } else {
      // Create new
      record = {
        id: `rec-${Date.now()}-${Math.random()}`,
        userId,
        date,
        mealType,
        count: newCount,
      };
      db.records.push(record);
      
      // Log
      if (!db.mealToggleLog) db.mealToggleLog = [];
      db.mealToggleLog.push({
        id: `log-${Date.now()}-${Math.random()}`,
        userId,
        date,
        mealType,
        action,
        oldCount: 0,
        newCount,
        timestamp: new Date().toISOString(),
      });
    }

    saveDb(db);

    // Notify manager if meal is turned off
    if (action === 'off') {
      const userInfo = db.users.find(u => u.id === userId);
      const managers = db.users.filter(u => u.role === 'manager' && u.status === 'approved');
      
      // TODO: Send notification to manager
      // For now, just log that a meal was turned off
      console.log(`Meal off notification: ${userInfo?.name} turned off ${mealType} on ${date}`);
    }

    return NextResponse.json({
      message: `Meal turned ${action}.`,
      record,
      daysAhead,
    });
  } catch (error) {
    console.error('Meal toggle error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

// GET: Fetch meal status for a specific user and date
export async function GET(req: NextRequest) {
  try {
    const { error, user } = authenticate(req);
    if (error) return error;

    const searchParams = req.nextUrl.searchParams;
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ message: 'Missing required parameter: date.' }, { status: 400 });
    }

    await ensureDbInit();
    const db = getDb();

    const userId = user!.id;
    const records = db.records.filter(r => r.userId === userId && r.date === date);

    return NextResponse.json({
      date,
      records: records.map(r => ({
        mealType: r.mealType,
        isOn: r.count > 0,
        count: r.count,
      })),
    });
  } catch (error) {
    console.error('Meal status fetch error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
