import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth';
import { getDb, saveDb, ensureDbInit } from '@/src/lib/db';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = authenticate(req, ['manager', 'admin']);
    if (error) return error;

    const { id } = await params;

    await ensureDbInit();
    const db = getDb();
    const filterMenus = db.menus.filter(m => m.id !== id);

    if (filterMenus.length === db.menus.length) {
      return NextResponse.json({ message: 'Menu item not found.' }, { status: 404 });
    }

    db.menus = filterMenus;
    saveDb(db);

    return NextResponse.json({ message: 'Menu item deleted successfully.' });
  } catch (error) {
    console.error('Delete menu error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
