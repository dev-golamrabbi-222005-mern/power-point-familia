import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth';
import { getDb, ensureDbInit } from '@/src/lib/db';
import { BazaarDutyInfo } from '@/src/types';

export async function GET(req: NextRequest) {
  try {
    const { error, user } = authenticate(req);
    if (error) return error;

    const date = req.nextUrl.searchParams.get('date') || new Date().toISOString().split('T')[0];

    await ensureDbInit();
    const db = getDb();
    const userId = user!.id;

    // Check if user has bazaar assignment on this date
    const assignment = db.bazaarAssignments.find(
      a => a.date === date && a.userId === userId
    );

    if (!assignment) {
      const response: BazaarDutyInfo = {
        hasDuty: false,
        date,
      };
      return NextResponse.json(response);
    }

    // Find pair partner
    let pairPartnerName = 'Partner';
    if (assignment.bazaarPairId) {
      const pair = db.bazaarPairs.find(p => p.id === assignment.bazaarPairId);
      if (pair) {
        const partnerId = pair.member1Id === userId ? pair.member2Id : pair.member1Id;
        const partner = db.users.find(u => u.id === partnerId);
        if (partner) pairPartnerName = partner.name;
      }
    }

    // Calculate budget or estimate from items
    const expense = db.bazaarExpenses.find(e => e.assignmentId === assignment.id);
    const budget = expense ? expense.totalCost : 500; // default estimated budget

    const response: BazaarDutyInfo = {
      hasDuty: true,
      date,
      pairPartnerName,
      shoppingList: assignment.shoppingList || ['Daily vegetables', 'Groceries'],
      budget,
      assignmentId: assignment.id,
      status: assignment.status,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Fetch calendar bazaar duty error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
