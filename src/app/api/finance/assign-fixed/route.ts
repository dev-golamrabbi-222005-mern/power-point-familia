import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth';
import { getDb, saveDb, ensureDbInit } from '@/src/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { error, user } = authenticate(req, ['manager', 'admin']);
    if (error) return error;

    const { userId, fixedCosts, pastMonthDue } = await req.json();

    if (!userId) {
      return NextResponse.json({ message: 'Target userId is required.' }, { status: 400 });
    }

    await ensureDbInit();
    const db = getDb();
    const targetUser = db.users.find(u => u.id === userId);

    if (!targetUser) {
      return NextResponse.json({ message: 'Target user not found.' }, { status: 404 });
    }

    // Save fixed costs breakdown and past month due on target user object
    targetUser.fixedCosts = {
      rent: Number(fixedCosts?.rent || 0),
      electricity: Number(fixedCosts?.electricity || 0),
      wifi: Number(fixedCosts?.wifi || 0),
      gas: Number(fixedCosts?.gas || 0),
      servant: Number(fixedCosts?.servant || 0),
      customFixedTotal: (Number(fixedCosts?.rent || 0) + Number(fixedCosts?.electricity || 0) + Number(fixedCosts?.wifi || 0) + Number(fixedCosts?.gas || 0) + Number(fixedCosts?.servant || 0))
    };

    targetUser.pastMonthDue = Number(pastMonthDue || 0);

    saveDb(db);

    return NextResponse.json({
      message: `Fixed costs & past due assigned successfully for ${targetUser.name}!`,
      user: targetUser
    });
  } catch (err) {
    console.error('Assign fixed costs error', err);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
