import webpush from 'web-push';
import { User } from '../../src/types';

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@familia.com';

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  try {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
  } catch (err) {
    console.error('VAPID setup error:', err);
  }
}

export async function sendWebPushNotification(user: User, payload: { title: string; body: string; url?: string }) {
  if (!user.pushSubscriptions || user.pushSubscriptions.length === 0) return;

  const notificationPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: '/icons/icon-192x192.png',
    data: { url: payload.url || '/dashboard' },
  });

  const promises = user.pushSubscriptions.map((sub) =>
    webpush.sendNotification(sub, notificationPayload).catch((err) => {
      console.error('Push notification send error:', err);
    })
  );

  await Promise.all(promises);
}
