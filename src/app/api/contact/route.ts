import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb, ensureDbInit } from '@/src/lib/db.js';
import { ContactMessage } from '@/src/types';

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: 'All fields (name, email, subject, message) are required.' },
        { status: 400 }
      );
    }

    await ensureDbInit();
    const db = getDb();

    const newMessage: ContactMessage = {
      id: `msg-${Date.now()}`,
      name,
      email,
      subject,
      message,
      createdAt: new Date().toISOString(),
      read: false,
    };

    db.contactMessages.push(newMessage);
    saveDb(db);

    return NextResponse.json({
      message: 'Your message has been sent! We will get back to you soon.'
    }, { status: 201 });
  } catch (error) {
    console.error('Contact form error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Reuse auth
    const { authenticate } = await import('@/src/lib/auth.js');
    const { error } = authenticate(req, ['admin']);
    if (error) return error;

    await ensureDbInit();
    const db = getDb();

    return NextResponse.json(db.contactMessages);
  } catch (error) {
    console.error('Fetch messages error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
