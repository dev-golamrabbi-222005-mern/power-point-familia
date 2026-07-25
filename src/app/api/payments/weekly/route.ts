import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth';
import { getDb, saveDb, ensureDbInit } from '@/src/lib/db';
import { WeeklyPayment } from '@/src/types';

// Helper: Get current week Monday & Sunday
function getWeekRange(dateStr?: string): { weekStart: string; weekEnd: string } {
  const d = dateStr ? new Date(dateStr) : new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(d.setDate(diff));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    weekStart: monday.toISOString().split('T')[0],
    weekEnd: sunday.toISOString().split('T')[0],
  };
}

export async function GET(req: NextRequest) {
  try {
    const { error, user } = authenticate(req);
    if (error) return error;

    await ensureDbInit();
    const db = getDb();

    if (user!.role === 'manager' || user!.role === 'admin') {
      // Enriched for managers/admins
      const enriched = db.weeklyPayments.map(w => {
        const u = db.users.find(usr => usr.id === w.userId);
        return { ...w, userName: u ? u.name : 'Unknown' };
      });
      return NextResponse.json(enriched);
    } else {
      return NextResponse.json(
        db.weeklyPayments.filter(w => w.userId === user!.id)
      );
    }
  } catch (error) {
    console.error('Fetch weekly payments error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error, user } = authenticate(req, ['member', 'manager', 'admin']);
    if (error) return error;

    const { weekStart, depositAmount } = await req.json();

    if (!weekStart || !depositAmount || Number(depositAmount) <= 0) {
      return NextResponse.json(
        { message: 'weekStart and depositAmount are required.' },
        { status: 400 }
      );
    }

    await ensureDbInit();
    const db = getDb();

    const { weekEnd } = getWeekRange(weekStart);
    const isFirstWeek = db.weeklyPayments.length === 0;
    const expectedAmount = isFirstWeek
      ? db.settings.initialWeekPayment
      : db.settings.weeklyPayment;

    // Find existing weekly payment record or create new
    let weeklyPayment = db.weeklyPayments.find(
      w => w.userId === user!.id && w.weekStart === weekStart
    );

    if (weeklyPayment) {
      weeklyPayment.paidAmount += Number(depositAmount);
      weeklyPayment.status = weeklyPayment.paidAmount >= expectedAmount ? 'paid' : 'partial';
    } else {
      const newPayment: WeeklyPayment = {
        id: `wp-${Date.now()}`,
        userId: user!.id,
        weekStart,
        weekEnd,
        expectedAmount,
        paidAmount: Number(depositAmount),
        status: Number(depositAmount) >= expectedAmount ? 'paid' : 'partial',
      };
      db.weeklyPayments.push(newPayment);
      saveDb(db);
      return NextResponse.json({ payment: newPayment, message: 'Weekly payment recorded.' }, { status: 201 });
    }

    saveDb(db);
    return NextResponse.json({ payment: weeklyPayment, message: 'Weekly payment updated.' });
  } catch (error) {
    console.error('Weekly payment error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
