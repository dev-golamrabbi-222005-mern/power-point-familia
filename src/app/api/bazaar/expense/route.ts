import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth.js';
import { getDb, saveDb, ensureDbInit } from '@/src/lib/db.js';
import { BazaarExpense } from '@/src/types';

export async function GET(req: NextRequest) {
  try {
    const { error, user } = authenticate(req);
    if (error) return error;

    await ensureDbInit();
    const db = getDb();

    if (user!.role === 'manager' || user!.role === 'admin') {
      const enriched = db.bazaarExpenses.map(e => {
        const u = db.users.find(usr => usr.id === e.userId);
        return { ...e, userName: u ? u.name : 'Unknown' };
      });
      return NextResponse.json(enriched);
    } else {
      const enriched = db.bazaarExpenses
        .filter(e => e.userId === user!.id)
        .map(e => {
          const u = db.users.find(usr => usr.id === e.userId);
          return { ...e, userName: u ? u.name : 'Unknown' };
        });
      return NextResponse.json(enriched);
    }
  } catch (error) {
    console.error('Fetch bazaar expenses error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error, user } = authenticate(req, ['member', 'manager', 'admin']);
    if (error) return error;

    const { assignmentId, date, items, totalCost, remarks, receiptImage } = await req.json();

    if (!assignmentId || !date || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: 'assignmentId, date, and items are required.' },
        { status: 400 }
      );
    }

    await ensureDbInit();
    const db = getDb();

    // Verify the assignment belongs to this user (unless manager/admin)
    const assignment = db.bazaarAssignments.find(a => a.id === assignmentId);
    if (!assignment) {
      return NextResponse.json({ message: 'Bazaar assignment not found.' }, { status: 404 });
    }
    if (assignment.userId !== user!.id && user!.role !== 'manager' && user!.role !== 'admin') {
      return NextResponse.json({ message: 'This is not your assigned bazaar.' }, { status: 403 });
    }

    // Update assignment status
    assignment.status = 'submitted';
    assignment.submittedAt = new Date().toISOString();

    const newExpense: BazaarExpense = {
      id: `bexp-${Date.now()}`,
      assignmentId,
      userId: assignment.userId,
      date,
      items,
      totalCost: totalCost || items.reduce((sum: number, item: any) => sum + Number(item.cost || 0), 0),
      status: 'pending',
      remarks,
      receiptImage,
      submittedAt: new Date().toISOString(),
    };

    db.bazaarExpenses.push(newExpense);
    saveDb(db);

    return NextResponse.json({
      expense: newExpense,
      message: 'Bazaar expense submitted! Awaiting manager verification.'
    }, { status: 201 });
  } catch (error) {
    console.error('Submit bazaar expense error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
