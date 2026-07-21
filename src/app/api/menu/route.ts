import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth.js';
import { getDb, saveDb, ensureDbInit } from '@/src/lib/db.js';
import { MealMenu } from '@/src/types';

export async function GET(req: NextRequest) {
  try {
    const { error } = authenticate(req);
    if (error) return error;

    await ensureDbInit();
    const db = getDb();
    return NextResponse.json(db.menus);
  } catch (error) {
    console.error('Fetch menu error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error } = authenticate(req, ['manager', 'admin']);
    if (error) return error;

    const { id, date, mealType, items, estimatedCost } = await req.json();

    if (!date || !mealType || !items || !Array.isArray(items) || estimatedCost === undefined) {
      return NextResponse.json(
        { message: 'date, mealType, items (array), and estimatedCost are required.' },
        { status: 400 }
      );
    }

    await ensureDbInit();
    const db = getDb();

    if (id) {
      // Edit existing menu
      const menuIndex = db.menus.findIndex(m => m.id === id);
      if (menuIndex !== -1) {
        db.menus[menuIndex] = { id, date, mealType, items, estimatedCost: Number(estimatedCost) };
        saveDb(db);
        return NextResponse.json({ menu: db.menus[menuIndex], message: 'Menu updated successfully.' });
      }
    }

    // Check duplicate menu on same date & mealType
    const duplicate = db.menus.find(m => m.date === date && m.mealType === mealType);
    if (duplicate) {
      return NextResponse.json(
        { message: `A menu for ${mealType} on ${date} already exists.` },
        { status: 400 }
      );
    }

    const newMenu: MealMenu = {
      id: `menu-${Date.now()}`,
      date,
      mealType,
      items,
      estimatedCost: Number(estimatedCost),
    };

    db.menus.push(newMenu);
    saveDb(db);

    return NextResponse.json({ menu: newMenu, message: 'Menu created successfully.' }, { status: 201 });
  } catch (error) {
    console.error('Menu save error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
