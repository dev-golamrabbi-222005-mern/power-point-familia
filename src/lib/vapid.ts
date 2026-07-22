import webpush from 'web-push';

// Default VAPID keys for zero-config Web Push functionality
export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa1Fpt0L0z6M_V_F_P1hYh4R02hC3X5v_j3Bv3S9S1F2x4E6v8G0H2I4K6L8M0';
export const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'u1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V';
export const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@familia.com';

webpush.setVapidDetails(
  VAPID_SUBJECT,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export default webpush;
