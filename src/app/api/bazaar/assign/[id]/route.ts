import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth.js';
import { getDb, saveDb, ensureDbInit } from '@/src/lib/db.js';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { error } = authenticate(req, ['manager', 'admin']);
    if (error) return error;

    await ensureDbInit();
    const db = getDb();
    const index = db.bazaarAssignments.findIndex(a => a.id === id);

    if (index === -1) {
      return NextResponse.json({ message: 'Assignment not found.' }, { status: 404 });
    }

    db.bazaarAssignments.splice(index, 1);
    saveDb(db);

    return NextResponse.json({ message: 'Bazaar assignment removed.' });
  } catch (error) {
    console.error('Delete bazaar assignment error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

// PUT: Mark a bazaar assignment as skipped (member absent/on leave)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { error } = authenticate(req, ['manager', 'admin']);
    if (error) return error;

    const { status } = await req.json();

    if (status !== 'skipped') {
      return NextResponse.json(
        { message: 'Status must be \"skipped\".' },
        { status: 400 }
      );
    }

    await ensureDbInit();
    const db = getDb();
    const assignmentIndex = db.bazaarAssignments.findIndex(a => a.id === id);

    if (assignmentIndex === -1) {
      return NextResponse.json({ message: 'Assignment not found.' }, { status: 404 });
    }

    const assignment = db.bazaarAssignments[assignmentIndex];
    if (assignment.status !== 'pending') {
      return NextResponse.json(
        { message: 'Can only skip a pending assignment.' },
        { status: 400 }
      );
    }

    assignment.status = 'skipped';
    saveDb(db);

    // Check auto-advance: if both members of the current pair are now done (verified or skipped)
    if (db.bazaarPairs.length > 0) {
      const currentPairIndex = db.settings.currentPairIndex;
      const currentPair = db.bazaarPairs[currentPairIndex % db.bazaarPairs.length];
      
      if (currentPair) {
        const pairMembers = [currentPair.member1Id, currentPair.member2Id];
        const allResolved = pairMembers.every(memberId =>
          db.bazaarAssignments.some(
            a => a.userId === memberId && (a.status === 'verified' || a.status === 'skipped')
          )
        );

        if (allResolved) {
          const oldIndex = db.settings.currentPairIndex;
          db.settings.currentPairIndex = (oldIndex + 1) % db.bazaarPairs.length;
          saveDb(db);

          const nextPair = db.bazaarPairs[db.settings.currentPairIndex];
          const m1 = db.users.find(u => u.id === nextPair.member1Id);
          const m2 = db.users.find(u => u.id === nextPair.member2Id);

          return NextResponse.json({
            message: `Member skipped! Pair advanced to: ${m1?.name || '?'} & ${m2?.name || '?'}`,
            assignment: { ...assignment, userName: db.users.find(u => u.id === assignment.userId)?.name },
            autoAdvanced: true,
            newPairIndex: db.settings.currentPairIndex,
          });
        }
      }
    }

    return NextResponse.json({
      message: 'Member marked as skipped for this bazaar.',
      assignment: { ...assignment, userName: db.users.find(u => u.id === assignment.userId)?.name },
    });
  } catch (error) {
    console.error('Skip assignment error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
