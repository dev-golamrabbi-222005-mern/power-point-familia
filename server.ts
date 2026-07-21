import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { getDb, saveDb, initMongoConnection } from './src/server/db.js';
import { User, MealMenu, MealRecord, Deposit, UserRole } from './src/types.js';

dotenv.config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'SUPER_SECRET_FAMILIA_JWT_KEY';

app.use(express.json());

// --- AUTHENTICATION MIDDLEWARE ---

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    name: string;
    status: 'pending' | 'approved' | 'rejected';
  };
}

function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Authentication token is missing' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      res.status(403).json({ message: 'Token is invalid or expired' });
      return;
    }
    req.user = decoded as AuthRequest['user'];
    next();
  });
}

function requireRole(roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: `Access denied. Requires one of roles: ${roles.join(', ')}` });
      return;
    }
    
    next();
  };
}

// --- API ENDPOINTS ---

// 1. Auth: Registration
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name || !phone) {
      res.status(400).json({ message: 'All fields (email, password, name, phone) are required.' });
      return;
    }

    const db = getDb();
    const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists.' });
      return;
    }

    // Auto-approve certain emails as admin (e.g. g.rabbi2005.555@gmail.com and admin@familia.com)
    const isAdminEmail = 
      email.toLowerCase() === 'g.rabbi2005.555@gmail.com' || 
      email.toLowerCase() === 'admin@familia.com';
    
    const role: UserRole = isAdminEmail ? 'admin' : 'user';
    const status = isAdminEmail ? 'approved' : 'pending';

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser: DatabaseSchema['users'][0] = {
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

    res.status(201).json({
      user: tokenUser,
      token,
      message: isAdminEmail ? 'Admin account registered and pre-approved!' : 'Account registered successfully! Waiting for Admin approval.'
    });
  } catch (error) {
    console.error('Registration error', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// 2. Auth: Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    const db = getDb();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const tokenUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      status: user.status,
    };

    const token = jwt.sign(tokenUser, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: tokenUser,
      token,
      message: 'Login successful.'
    });
  } catch (error) {
    console.error('Login error', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// 3. Auth: Me
app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  const db = getDb();
  const fullUser = db.users.find(u => u.id === req.user?.id);
  if (!fullUser) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  res.json({
    user: {
      id: fullUser.id,
      email: fullUser.email,
      name: fullUser.name,
      phone: fullUser.phone,
      role: fullUser.role,
      status: fullUser.status,
      createdAt: fullUser.createdAt
    }
  });
});

// 4. Auth: Update Profile Settings
app.put('/api/auth/profile', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { name, phone, password } = req.body;
    const db = getDb();
    const userIndex = db.users.findIndex(u => u.id === req.user?.id);

    if (userIndex === -1) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    if (name) db.users[userIndex].name = name;
    if (phone) db.users[userIndex].phone = phone;
    
    if (password) {
      const salt = bcrypt.genSaltSync(10);
      db.users[userIndex].passwordHash = bcrypt.hashSync(password, salt);
    }

    saveDb(db);

    res.json({
      user: {
        id: db.users[userIndex].id,
        email: db.users[userIndex].email,
        name: db.users[userIndex].name,
        phone: db.users[userIndex].phone,
        role: db.users[userIndex].role,
        status: db.users[userIndex].status,
        createdAt: db.users[userIndex].createdAt
      },
      message: 'Profile updated successfully.'
    });
  } catch (error) {
    console.error('Update profile error', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// 5. Dashboard: Get Statistics
app.get('/api/dashboard/stats', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const db = getDb();
    const userId = req.user.id;
    const userRole = req.user.role;
    const mealRate = db.settings?.mealRate || 45;

    // A: Calculate Member statistics (approved deposits, consumed/booked meals)
    const userDeposits = db.deposits.filter(d => d.userId === userId);
    const totalDeposits = userDeposits
      .filter(d => d.status === 'approved')
      .reduce((sum, d) => sum + d.amount, 0);
    
    const pendingDeposits = userDeposits
      .filter(d => d.status === 'pending')
      .reduce((sum, d) => sum + d.amount, 0);

    const userMealRecords = db.records.filter(r => r.userId === userId);
    const totalMealsCount = userMealRecords.reduce((sum, r) => sum + r.count, 0);
    const totalMealCost = totalMealsCount * mealRate;
    const totalBalance = totalDeposits - totalMealCost;

    const stats: any = {
      userStats: {
        totalBalance,
        totalDeposits,
        totalMealsCount,
        totalMealCost,
        pendingDeposits,
      }
    };

    // B: Calculate System-wide Manager/Admin aggregates if role fits
    if (userRole === 'manager' || userRole === 'admin') {
      const allApprovedDeposits = db.deposits
        .filter(d => d.status === 'approved')
        .reduce((sum, d) => sum + d.amount, 0);

      const allPendingDepositsCount = db.deposits.filter(d => d.status === 'pending').length;
      
      const allMealsCount = db.records.reduce((sum, r) => sum + r.count, 0);
      const allMealCost = allMealsCount * mealRate;
      const totalSystemBalance = allApprovedDeposits - allMealCost;

      const membersCount = db.users.filter(u => u.role === 'member' && u.status === 'approved').length;
      const activeMenuCount = db.menus.length;

      stats.managerStats = {
        totalSystemBalance,
        totalSystemDeposits: allApprovedDeposits,
        totalSystemMealsCount: allMealsCount,
        totalSystemMealCost: allMealCost,
        pendingDepositsCount: allPendingDepositsCount,
        membersCount,
        activeMenuCount
      };
    }

    res.json(stats);
  } catch (error) {
    console.error('Stats fetch error', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// 6. Members Management (Manager & Admin only)
app.get('/api/members', authenticateToken, requireRole(['manager', 'admin']), (req: AuthRequest, res: Response) => {
  const db = getDb();
  // Don't expose password hash
  const sanitizedUsers = db.users.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    phone: u.phone,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt
  }));
  res.json(sanitizedUsers);
});

// 7. Update user role / status (Admin only)
app.put('/api/members/:id/role', authenticateToken, requireRole(['admin']), (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role, status } = req.body;

    const db = getDb();
    const userIndex = db.users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    if (db.users[userIndex].id === req.user?.id) {
      res.status(400).json({ message: 'You cannot change your own role/status!' });
      return;
    }

    if (role) db.users[userIndex].role = role;
    if (status) db.users[userIndex].status = status;

    saveDb(db);

    res.json({
      user: {
        id: db.users[userIndex].id,
        email: db.users[userIndex].email,
        name: db.users[userIndex].name,
        phone: db.users[userIndex].phone,
        role: db.users[userIndex].role,
        status: db.users[userIndex].status
      },
      message: 'User updated successfully.'
    });
  } catch (error) {
    console.error('Update role error', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// 8. Menu: Get items
app.get('/api/menu', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = getDb();
  res.json(db.menus);
});

// 9. Menu: Add or Update Menu (Manager & Admin only)
app.post('/api/menu', authenticateToken, requireRole(['manager', 'admin']), (req: AuthRequest, res: Response) => {
  try {
    const { id, date, mealType, items, estimatedCost } = req.body;

    if (!date || !mealType || !items || !Array.isArray(items) || estimatedCost === undefined) {
      res.status(400).json({ message: 'date, mealType, items (array), and estimatedCost are required.' });
      return;
    }

    const db = getDb();

    if (id) {
      // Edit existing menu
      const menuIndex = db.menus.findIndex(m => m.id === id);
      if (menuIndex !== -1) {
        db.menus[menuIndex] = { id, date, mealType, items, estimatedCost: Number(estimatedCost) };
        saveDb(db);
        res.json({ menu: db.menus[menuIndex], message: 'Menu updated successfully.' });
        return;
      }
    }

    // Check duplicate menu on same date & mealType
    const duplicate = db.menus.find(m => m.date === date && m.mealType === mealType);
    if (duplicate) {
      res.status(400).json({ message: `A menu for ${mealType} on ${date} already exists.` });
      return;
    }

    const newMenu: MealMenu = {
      id: `menu-${Date.now()}`,
      date,
      mealType,
      items,
      estimatedCost: Number(estimatedCost),
    };

    db.menus.push(newMenu);
    saveDb(db);

    res.status(201).json({ menu: newMenu, message: 'Menu created successfully.' });
  } catch (error) {
    console.error('Menu save error', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Menu: Delete item (Manager & Admin only)
app.delete('/api/menu/:id', authenticateToken, requireRole(['manager', 'admin']), (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDb();
    const filterMenus = db.menus.filter(m => m.id !== id);
    if (filterMenus.length === db.menus.length) {
      res.status(404).json({ message: 'Menu item not found.' });
      return;
    }
    db.menus = filterMenus;
    saveDb(db);
    res.json({ message: 'Menu item deleted successfully.' });
  } catch (error) {
    console.error('Delete menu error', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// 10. Records: Get meal bookings
app.get('/api/records', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  const db = getDb();
  if (req.user.role === 'manager' || req.user.role === 'admin') {
    // Managers/Admins can see all records
    res.json(db.records);
  } else {
    // Members see only their own
    res.json(db.records.filter(r => r.userId === req.user?.id));
  }
});

// 11. Records: Book / Edit meals
app.post('/api/records/book', authenticateToken, requireRole(['member', 'manager', 'admin']), (req: AuthRequest, res: Response) => {
  try {
    const { date, mealType, count, userId: targetUserId } = req.body;

    if (!date || !mealType || count === undefined) {
      res.status(400).json({ message: 'date, mealType, and count are required.' });
      return;
    }

    if (Number(count) < 0 || Number(count) > 5) {
      res.status(400).json({ message: 'Meal count must be between 0 and 5.' });
      return;
    }

    const db = getDb();
    
    // Determine whose meal is being booked (managers/admins can book on behalf of anyone)
    let finalUserId = req.user?.id;
    if (targetUserId && (req.user?.role === 'manager' || req.user?.role === 'admin')) {
      finalUserId = targetUserId;
    }

    if (!finalUserId) {
      res.status(400).json({ message: 'Target user is required.' });
      return;
    }

    const recordIndex = db.records.findIndex(r => r.userId === finalUserId && r.date === date && r.mealType === mealType);

    if (recordIndex !== -1) {
      if (Number(count) === 0) {
        // Remove if set to 0
        db.records.splice(recordIndex, 1);
        saveDb(db);
        res.json({ message: 'Meal booking removed.' });
      } else {
        db.records[recordIndex].count = Number(count);
        saveDb(db);
        res.json({ record: db.records[recordIndex], message: 'Meal booking updated.' });
      }
    } else {
      if (Number(count) > 0) {
        const newRecord: MealRecord = {
          id: `rec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          userId: finalUserId,
          date,
          mealType,
          count: Number(count),
        };
        db.records.push(newRecord);
        saveDb(db);
        res.status(201).json({ record: newRecord, message: 'Meal booked successfully.' });
      } else {
        res.json({ message: 'Nothing to book.' });
      }
    }
  } catch (error) {
    console.error('Book meal error', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// 12. Deposits: Get List
app.get('/api/deposits', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  const db = getDb();
  
  if (req.user.role === 'manager' || req.user.role === 'admin') {
    // Return all deposits with user details attached
    const enrichedDeposits = db.deposits.map(d => {
      const u = db.users.find(usr => usr.id === d.userId);
      return {
        ...d,
        userName: u ? u.name : 'Unknown User',
        userEmail: u ? u.email : '',
      };
    });
    res.json(enrichedDeposits);
  } else {
    // Regular members see only theirs
    res.json(db.deposits.filter(d => d.userId === req.user?.id));
  }
});

// 13. Deposits: Add Deposit Request (Members only)
app.post('/api/deposits', authenticateToken, requireRole(['member']), (req: AuthRequest, res: Response) => {
  try {
    const { amount, date, paymentMethod, transactionId, remarks } = req.body;

    if (!amount || !date || !paymentMethod || !transactionId) {
      res.status(400).json({ message: 'amount, date, paymentMethod, and transactionId are required.' });
      return;
    }

    if (Number(amount) <= 0) {
      res.status(400).json({ message: 'Amount must be greater than 0.' });
      return;
    }

    const db = getDb();
    const newDeposit: Deposit = {
      id: `dep-${Date.now()}`,
      userId: req.user!.id,
      amount: Number(amount),
      date,
      paymentMethod,
      transactionId,
      status: 'pending',
      remarks,
    };

    db.deposits.push(newDeposit);
    saveDb(db);

    res.status(201).json({ deposit: newDeposit, message: 'Deposit request submitted successfully. Waiting for Manager/Admin approval.' });
  } catch (error) {
    console.error('Deposit submission error', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// 14. Deposits: Approve or Reject (Manager & Admin only)
app.put('/api/deposits/:id/status', authenticateToken, requireRole(['manager', 'admin']), (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' | 'rejected'

    if (!status || !['approved', 'rejected'].includes(status)) {
      res.status(400).json({ message: 'Status must be approved or rejected.' });
      return;
    }

    const db = getDb();
    const depIndex = db.deposits.findIndex(d => d.id === id);

    if (depIndex === -1) {
      res.status(404).json({ message: 'Deposit record not found.' });
      return;
    }

    db.deposits[depIndex].status = status;
    saveDb(db);

    res.json({ deposit: db.deposits[depIndex], message: `Deposit request successfully ${status}.` });
  } catch (error) {
    console.error('Deposit status update error', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// 15. Settings: Get Settings
app.get('/api/settings', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = getDb();
  res.json(db.settings || { mealRate: 45 });
});

// 16. Settings: Update Settings (Admin only)
app.put('/api/settings', authenticateToken, requireRole(['admin']), (req: AuthRequest, res: Response) => {
  try {
    const { mealRate } = req.body;

    if (mealRate === undefined || Number(mealRate) <= 0) {
      res.status(400).json({ message: 'A valid meal rate greater than 0 is required.' });
      return;
    }

    const db = getDb();
    db.settings = { mealRate: Number(mealRate) };
    saveDb(db);

    res.json({ settings: db.settings, message: 'Meal rate settings updated successfully.' });
  } catch (error) {
    console.error('Settings update error', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// --- VITE DEV / PRODUCTION MIDDLEWARE ---

async function startServer() {
  // Initialize MongoDB connection
  await initMongoConnection();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();

// Internal database schema extension type helper for tsx compiling
type DatabaseSchema = import('./src/server/db.js').DatabaseSchema;
