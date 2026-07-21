import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { UserRole } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'SUPER_SECRET_FAMILIA_JWT_KEY';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
}

export function authenticate(req: NextRequest, allowedRoles?: UserRole[]) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return { error: NextResponse.json({ message: 'Authentication token is missing' }, { status: 401 }), user: null };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    
    if (allowedRoles && !allowedRoles.includes(decoded.role)) {
      return {
        error: NextResponse.json({ message: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}` }, { status: 403 }),
        user: decoded
      };
    }

    return { error: null, user: decoded };
  } catch (err) {
    return { error: NextResponse.json({ message: 'Token is invalid or expired' }, { status: 403 }), user: null };
  }
}
