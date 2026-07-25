import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth';
import { getDb, saveDb, ensureDbInit } from '@/src/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, user } = authenticate(req, ['admin']);
    if (error) return error;

    const { id } = await params;
    const { role, status } = await req.json();

    await ensureDbInit();
    const db = getDb();
    const userIndex = db.users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    if (db.users[userIndex].id === user!.id) {
      return NextResponse.json(
        { message: 'You cannot change your own role/status!' },
        { status: 400 }
      );
    }

    if (role) db.users[userIndex].role = role;
    if (status) db.users[userIndex].status = status;

    saveDb(db);

    return NextResponse.json({
      user: {
        id: db.users[userIndex].id,
        email: db.users[userIndex].email,
        name: db.users[userIndex].name,
        phone: db.users[userIndex].phone,
        role: db.users[userIndex].role,
        status: db.users[userIndex].status
      },
      message: 'User updated successfully.'
    });
  } catch (error) {
    console.error('Update role error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
