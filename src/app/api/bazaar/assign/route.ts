import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth.js';
import { getDb, saveDb, ensureDbInit } from '@/src/lib/db.js';
import { BazaarAssignment } from '@/src/types';

export async function GET(req: NextRequest) {
  try {
    const { error, user } = authenticate(req);
    if (error) return error;

    await ensureDbInit();
    const db = getDb();
    
    if (user!.role === 'manager' || user!.role === 'admin') {
      // Return all assignments with user names
      const enriched = db.bazaarAssignments.map(a => {
        const u = db.users.find(usr => usr.id === a.userId);
        return { ...a, userName: u ? u.name : 'Unknown' };
      });
      return NextResponse.json(enriched);
    } else {
      // Members see only their own assignments
      const enriched = db.bazaarAssignments
        .filter(a => a.userId === user!.id)
        .map(a => {
          const u = db.users.find(usr => usr.id === a.userId);
          return { ...a, userName: u ? u.name : 'Unknown' };
        });
      return NextResponse.json(enriched);
    }
  } catch (error) {
    console.error('Fetch bazaar assignments error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error, user } = authenticate(req, ['manager', 'admin']);
    if (error) return error;

    const { userId, date, shoppingList } = await req.json();

    if (!userId || !date) {
      return NextResponse.json(
        { message: 'userId and date are required.' },
        { status: 400 }
      );
    }

    await ensureDbInit();
    const db = getDb();

    // Check for duplicate assignment on same date for same user
    const existing = db.bazaarAssignments.find(
      a => a.userId === userId && a.date === date && a.status !== 'verified'
    );
    if (existing) {
      return NextResponse.json(
        { message: 'This member already has a bazaar assignment on this date.' },
        { status: 400 }
      );
    }

    const newAssignment: BazaarAssignment = {
      id: `bazaar-${Date.now()}`,
      userId,
      date,
      shoppingList: shoppingList || [],
      status: 'pending',
    };

    db.bazaarAssignments.push(newAssignment);
    
    // Increment bazaar count for the assigned user
    const assignedUser = db.users.find(u => u.id === userId);
    if (assignedUser) {
      assignedUser.bazaarCount = (assignedUser.bazaarCount || 0) + 1;
    }
    
    saveDb(db);

    return NextResponse.json({
      assignment: newAssignment,
      message: 'Bazaar assignment created successfully.'
    }, { status: 201 });
  } catch (error) {
    console.error('Create bazaar assignment error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

// Handle bazaar delegation
export async function PUT(req: NextRequest) {
  try {
    const { error, user } = authenticate(req, ['member', 'manager', 'admin']);
    if (error) return error;

    const { assignmentId, delegateToUserId } = await req.json();

    if (!assignmentId || !delegateToUserId) {
      return NextResponse.json(
        { message: 'assignmentId and delegateToUserId are required.' },
        { status: 400 }
      );
    }

    await ensureDbInit();
    const db = getDb();

    const assignment = db.bazaarAssignments.find(a => a.id === assignmentId);
    if (!assignment) {
      return NextResponse.json({ message: 'Bazaar assignment not found.' }, { status: 404 });
    }

    // Only the assigned user or manager/admin can delegate
    if (assignment.userId !== user!.id && user!.role !== 'manager' && user!.role !== 'admin') {
      return NextResponse.json({ message: 'You can only delegate your own bazaar assignments.' }, { status: 403 });
    }

    if (assignment.status !== 'pending') {
      return NextResponse.json({ message: 'Cannot delegate a submitted or verified assignment.' }, { status: 400 });
    }

    // Store who delegated from
    const originalUserId = assignment.userId;
    assignment.delegatedFrom = originalUserId;
    
    // Reassign to delegate
    assignment.userId = delegateToUserId;
    assignment.status = 'pending';

    // The original person still gets +1 bazaar count (extra date on their profile)
    const originalUser = db.users.find(u => u.id === originalUserId);
    if (originalUser) {
      originalUser.bazaarCount = (originalUser.bazaarCount || 0) + 1;
    }
    // Delegate does NOT get extra count — they just take the assignment

    saveDb(db);

    const delegateUserObj = db.users.find(u => u.id === delegateToUserId);
    return NextResponse.json({
      assignment: { ...assignment, userName: delegateUserObj?.name },
      message: 'Bazaar delegated successfully. Extra bazaar count recorded on your profile.'
    });
  } catch (error) {
    console.error('Bazaar delegation error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
