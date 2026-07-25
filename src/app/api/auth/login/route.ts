import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb, ensureDbInit } from '@/src/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'SUPER_SECRET_FAMILIA_JWT_KEY';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required.' },
        { status: 400 }
      );
    }

    await ensureDbInit();
    const db = getDb();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return NextResponse.json(
        { message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const tokenUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      status: user.status,
    };

    const token = jwt.sign(tokenUser, JWT_SECRET, { expiresIn: '7d' });

    return NextResponse.json({
      user: tokenUser,
      token,
      message: 'Login successful.'
    });
  } catch (error) {
    console.error('Login error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
