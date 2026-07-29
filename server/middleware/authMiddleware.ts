import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_familia_key_2026';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  name: string;
}

export function verifyAuthToken(req: Request): AuthenticatedUser | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    return decoded;
  } catch (err) {
    return null;
  }
}
