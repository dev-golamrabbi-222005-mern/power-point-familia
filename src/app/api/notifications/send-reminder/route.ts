import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth';
import { getDb, ensureDbInit } from '@/src/lib/db';
import webpush from '@/src/lib/vapid';

export async function POST(req: NextRequest) {
  try {
    const { error } = authenticate(req, ['manager', 'admin']);
    if (error) return error;

    const { userIds, title, message } = await req.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ message: 'Target userIds array is required.' }, { status: 400 });
    }

    await ensureDbInit();
    const db = getDb();

    let pushCount = 0;
    const payload = JSON.stringify({
      title: title || 'Payment Reminder - Power Point Familia',
      body: message || 'Your account balance is in deficit. Please submit a deposit to clear your dues.',
      url: '/'
    });

    for (const userId of userIds) {
      const targetUser = db.users.find(u => u.id === userId);
      if (targetUser && targetUser.pushSubscriptions && targetUser.pushSubscriptions.length > 0) {
        for (const sub of targetUser.pushSubscriptions) {
          try {
            await webpush.sendNotification(sub, payload);
            pushCount++;
          } catch (pushErr) {
            console.error(`Failed to send push to user ${userId}:`, pushErr);
          }
        }
      }
    }

    return NextResponse.json({
      message: `Push notification sent to ${pushCount} active device subscriptions.`,
      sentCount: pushCount
    });
  } catch (err) {
    console.error('Send reminder error', err);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
