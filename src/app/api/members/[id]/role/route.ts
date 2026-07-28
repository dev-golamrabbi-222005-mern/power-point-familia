import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth';
import { getDb, saveDb, ensureDbInit } from '@/src/lib/db';

// PUT: Full A-Z User Profile & Status Edit (Admin Only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, user } = authenticate(req, ['admin']);
    if (error) return error;

    const { id } = await params;
    const body = await req.json();
    const { name, email, phone, role, status } = body;

    await ensureDbInit();
    const db = getDb();
    const userIndex = db.users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    if (db.users[userIndex].id === user!.id && (role !== undefined && role !== 'admin')) {
      return NextResponse.json(
        { message: 'You cannot demote yourself from Superuser/Admin role!' },
        { status: 400 }
      );
    }

    // A-Z Profile Editing
    if (name) db.users[userIndex].name = name;
    if (email) db.users[userIndex].email = email;
    if (phone !== undefined) db.users[userIndex].phone = phone;
    if (role) db.users[userIndex].role = role;
    if (status) db.users[userIndex].status = status;

    saveDb(db);

    return NextResponse.json({
      user: db.users[userIndex],
      message: 'User profile updated successfully.'
    });
  } catch (error) {
    console.error('Update user error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

// DELETE: Permanent User Removal (Admin Only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, user } = authenticate(req, ['admin']);
    if (error) return error;

    const { id } = await params;

    await ensureDbInit();
    const db = getDb();

    if (id === user!.id) {
      return NextResponse.json({ message: 'You cannot delete your own account!' }, { status: 400 });
    }

    const userIndex = db.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    // Delete user from db.users
    db.users.splice(userIndex, 1);
    saveDb(db);

    return NextResponse.json({ message: 'User account deleted permanently.' });
  } catch (error) {
    console.error('Delete user error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
