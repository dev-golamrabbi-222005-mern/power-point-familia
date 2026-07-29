import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb, saveDb } from '../config/db';
import { User } from '../../src/types';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_familia_key_2026';

export async function loginUser(body: { email?: string; password?: string }) {
  const { email, password } = body;
  if (!email || !password) {
    return { status: 400, data: { message: 'Email and password are required.' } };
  }

  const dbData = await getDb();
  const foundUser = dbData.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (!foundUser) {
    return { status: 401, data: { message: 'Invalid email or password.' } };
  }

  const isPasswordValid = bcrypt.compareSync(password, foundUser.passwordHash);
  if (!isPasswordValid) {
    return { status: 401, data: { message: 'Invalid email or password.' } };
  }

  const tokenPayload = {
    id: foundUser.id,
    email: foundUser.email,
    role: foundUser.role,
    name: foundUser.name,
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

  const { passwordHash: _, ...safeUser } = foundUser;
  return {
    status: 200,
    data: {
      message: 'Login successful',
      token,
      user: safeUser,
    },
  };
}

export async function registerUser(body: { name?: string; email?: string; phone?: string; password?: string }) {
  const { name, email, phone, password } = body;
  if (!name || !email || !phone || !password) {
    return { status: 400, data: { message: 'All fields are required.' } };
  }

  const dbData = await getDb();
  const existingUser = dbData.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (existingUser) {
    return { status: 400, data: { message: 'An account with this email already exists.' } };
  }

  const isFirstUser = dbData.users.length === 0;
  const newUserRole = isFirstUser ? 'admin' : 'user';

  const newUser: User & { passwordHash: string } = {
    id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    name,
    email: email.toLowerCase(),
    phone,
    role: newUserRole,
    status: isFirstUser ? 'approved' : 'pending',
    createdAt: new Date().toISOString(),
    passwordHash: bcrypt.hashSync(password, 10),
    bazaarCount: 0,
  };

  dbData.users.push(newUser);
  await saveDb(dbData);

  const tokenPayload = {
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
    name: newUser.name,
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });
  const { passwordHash: _, ...safeUser } = newUser;

  return {
    status: 201,
    data: {
      message: 'User registered successfully',
      token,
      user: safeUser,
    },
  };
}
