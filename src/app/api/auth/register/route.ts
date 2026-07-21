import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb, saveDb, ensureDbInit } from '@/src/lib/db.js';
import { UserRole } from '@/src/types';

const JWT_SECRET = process.env.JWT_SECRET || 'SUPER_SECRET_FAMILIA_JWT_KEY';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, phone } = await req.json();

    if (!email || !password || !name || !phone) {
      return NextResponse.json(
        { message: 'All fields (email, password, name, phone) are required.' },
        { status: 400 }
      );
    }

    await ensureDbInit();
    const db = getDb();
    const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists.' },
        { status: 400 }
      );
    }

    const isAdminEmail = 
      email.toLowerCase() === 'g.rabbi2005.555@gmail.com' || 
      email.toLowerCase() === 'admin@familia.com';
    
    const role: UserRole = isAdminEmail ? 'admin' : 'user';
    const status: 'pending' | 'approved' | 'rejected' = isAdminEmail ? 'approved' : 'pending';

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser = {
      id: `user-${Date.now()}`,
      email: email.toLowerCase(),
      name,
      phone,
      role,
      status,
      createdAt: new Date().toISOString(),
      passwordHash,
    };

    db.users.push(newUser);
    saveDb(db);

    const tokenUser = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
      status: newUser.status,
    };

    const token = jwt.sign(tokenUser, JWT_SECRET, { expiresIn: '7d' });

    return NextResponse.json({
      user: tokenUser,
      token,
      message: isAdminEmail ? 'Admin account registered and pre-approved!' : 'Account registered successfully! Waiting for Admin approval.'
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
