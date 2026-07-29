import { AuthenticatedUser } from './authMiddleware';

export function hasRole(user: AuthenticatedUser | null, allowedRoles: string[]): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}
