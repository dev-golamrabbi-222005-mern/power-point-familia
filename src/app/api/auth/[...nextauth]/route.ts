import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import jwt from 'jsonwebtoken';
import { getDb, ensureDbInit, saveDb } from '@/src/lib/db';
import { User } from '@/src/types';

const JWT_SECRET = process.env.JWT_SECRET || 'power_point_familia_super_secure_jwt_secret_key_2026';
const DEFAULT_ADMIN = (process.env.DEFAULT_ADMIN_EMAIL || 'g.rabbi.dev@gmail.com').toLowerCase();

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      try {
        await ensureDbInit();
        const db = getDb();
        const cleanEmail = user.email.toLowerCase().trim();
        const isAdmin = cleanEmail === DEFAULT_ADMIN;
        const profileImage = (user.image || (profile as any)?.picture || '') as string;
        const displayName = user.name || cleanEmail.split('@')[0];

        let dbUser = db.users.find((u) => u.email.toLowerCase() === cleanEmail);

        if (!dbUser) {
          const newUser: User & { passwordHash: string; photoURL?: string } = {
            id: user.id || `user_g_${Date.now()}`,
            email: cleanEmail,
            name: displayName,
            phone: '',
            role: isAdmin ? 'admin' : 'member',
            status: isAdmin ? 'approved' : 'pending',
            createdAt: new Date().toISOString(),
            bazaarCount: 0,
            passwordHash: '',
            image: profileImage,
            photoURL: profileImage,
          };
          db.users.push(newUser);
          await saveDb(db);
        } else {
          let modified = false;
          if (isAdmin && (dbUser.role !== 'admin' || dbUser.status !== 'approved')) {
            dbUser.role = 'admin';
            dbUser.status = 'approved';
            modified = true;
          }
          if (profileImage && (dbUser.image !== profileImage || dbUser.photoURL !== profileImage)) {
            dbUser.image = profileImage;
            dbUser.photoURL = profileImage;
            modified = true;
          }
          if (displayName && (!dbUser.name || dbUser.name.includes('@'))) {
            dbUser.name = displayName;
            modified = true;
          }
          if (modified) {
            await saveDb(db);
          }
        }
        return true;
      } catch (err) {
        console.error('NextAuth signIn error:', err);
        return false;
      }
    },

    async jwt({ token, user, trigger, session }) {
      if (token?.email) {
        try {
          await ensureDbInit();
          const db = getDb();
          const cleanEmail = token.email.toLowerCase().trim();
          const dbUser = db.users.find((u) => u.email.toLowerCase() === cleanEmail);

          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.status = dbUser.status;
            token.name = dbUser.name;
            token.image = dbUser.image || dbUser.photoURL || token.picture || '';

            const tokenPayload = {
              id: dbUser.id,
              email: dbUser.email,
              role: dbUser.role,
              name: dbUser.name,
              status: dbUser.status,
              image: token.image,
              photoURL: token.image,
            };

            (token as any).jwtToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });
          }
        } catch (e) {
          console.error('NextAuth jwt callback error:', e);
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).status = token.status;
        (session.user as any).name = token.name;
        (session.user as any).image = token.image;
        (session.user as any).photoURL = token.image;
        (session as any).jwtToken = (token as any).jwtToken;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'power_point_familia_super_secure_jwt_secret_key_2026',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
