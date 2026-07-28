import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';
import { User, MealMenu, MealRecord, Deposit, SystemSettings, BazaarAssignment, BazaarExpense, BazaarPair, WeeklyPayment, ContactMessage, SharedBill, MemberBillPayment, RefundRequest, MonthlySummary, MealToggleLog, AdminChangeRequest } from '../types';

export interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  menus: MealMenu[];
  records: MealRecord[];
  deposits: Deposit[];
  bazaarAssignments: BazaarAssignment[];
  bazaarExpenses: BazaarExpense[];
  bazaarPairs: BazaarPair[];
  weeklyPayments: WeeklyPayment[];
  contactMessages: ContactMessage[];
  sharedBills: SharedBill[];
  memberBillPayments: MemberBillPayment[];
  refundRequests: RefundRequest[];
  monthlySummaries: MonthlySummary[];
  mealToggleLog?: MealToggleLog[];
  adminChangeRequests?: AdminChangeRequest[];
  settings: SystemSettings;
}

const DB_FILE = path.join(process.cwd(), 'db.json');

const DEFAULT_SETTINGS: SystemSettings = {
  mealRate: 45,
  weeklyPayment: 500,
  initialWeekPayment: 1000,
  monthlyFlatRate: 2500,
  startWeekDate: new Date().toISOString().split('T')[0],
  autoBookMeals: true,
  currentPairIndex: 0,
  financeVisibilityDurationMinutes: 60,
};

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'Power-Point-Famila';

let client: MongoClient | null = null;
let dbInstance: any = null;
let memoryDb: DatabaseSchema | null = null;

export function getCleanMongoUri(): string | null {
  const raw = process.env.MONGODB_URI;
  if (!raw) return null;
  const clean = raw.trim().replace(/;$/, '').replace(/^["']|["']$/g, '');
  if (!clean.startsWith('mongodb://') && !clean.startsWith('mongodb+srv://')) {
    return null;
  }
  return clean;
}

export async function getMongoClient() {
  const uri = getCleanMongoUri();
  if (!uri) throw new Error('Invalid or missing MONGODB_URI');
  if (!client) {
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    });
    await client.connect();
    dbInstance = client.db(DB_NAME);
    console.log(`Successfully connected to MongoDB database: ${DB_NAME}`);
  }
  return dbInstance;
}

async function syncCollection(colName: string, localItems: any[]) {
  try {
    const db = await getMongoClient();
    const col = db.collection(colName);
    
    for (const item of localItems) {
      await col.replaceOne({ id: item.id }, item, { upsert: true });
    }
    
    const localIds = localItems.map(item => item.id);
    await col.deleteMany({ id: { $nin: localIds } });
  } catch (error) {
    console.error(`Error syncing collection ${colName}:`, error);
  }
}

async function syncSettings(settings: SystemSettings) {
  try {
    const db = await getMongoClient();
    const col = db.collection('settings');
    await col.replaceOne({}, settings, { upsert: true });
  } catch (error) {
    console.error('Error syncing settings:', error);
  }
}

export async function seedMongo(data: DatabaseSchema): Promise<void> {
  try {
    const db = await getMongoClient();
    if (data.users.length > 0) await db.collection('users').insertMany(data.users);
    if (data.menus.length > 0) await db.collection('menus').insertMany(data.menus);
    if (data.records.length > 0) await db.collection('records').insertMany(data.records);
    if (data.deposits.length > 0) await db.collection('deposits').insertMany(data.deposits);
    await db.collection('settings').insertOne(data.settings);
    console.log('Seeded default data successfully to MongoDB.');
  } catch (error) {
    console.error('Error seeding default data to MongoDB:', error);
  }
}

export async function syncToMongo(data: DatabaseSchema): Promise<void> {
  try {
    const uri = getCleanMongoUri();
    if (!uri) return;
    await syncCollection('users', data.users);
    await syncCollection('menus', data.menus);
    await syncCollection('records', data.records);
    await syncCollection('deposits', data.deposits);
    await syncCollection('bazaarAssignments', data.bazaarAssignments || []);
    await syncCollection('bazaarExpenses', data.bazaarExpenses || []);
    await syncCollection('bazaarPairs', data.bazaarPairs || []);
    await syncCollection('weeklyPayments', data.weeklyPayments || []);
    await syncCollection('contactMessages', data.contactMessages || []);
    await syncCollection('sharedBills', data.sharedBills || []);
    await syncCollection('memberBillPayments', data.memberBillPayments || []);
    await syncCollection('refundRequests', data.refundRequests || []);
    await syncCollection('monthlySummaries', data.monthlySummaries || []);
    await syncSettings(data.settings);
  } catch (error) {
    console.error('Failed to synchronize database with MongoDB:', error);
  }
}

export async function initMongoConnection(): Promise<void> {
  try {
    const uri = getCleanMongoUri();
    if (!uri) {
      console.log('No valid MONGODB_URI configured. Using local db.json storage.');
      memoryDb = getDb();
      return;
    }
    const db = await getMongoClient();
    
    const mongoUsers = await db.collection('users').find({}).toArray();
    const mongoMenus = await db.collection('menus').find({}).toArray();
    const mongoRecords = await db.collection('records').find({}).toArray();
    const mongoDeposits = await db.collection('deposits').find({}).toArray();
    const mongoBazaarAssignments = await db.collection('bazaarAssignments').find({}).toArray();
    const mongoBazaarExpenses = await db.collection('bazaarExpenses').find({}).toArray();
    const mongoBazaarPairs = await db.collection('bazaarPairs').find({}).toArray();
    const mongoWeeklyPayments = await db.collection('weeklyPayments').find({}).toArray();
    const mongoContactMessages = await db.collection('contactMessages').find({}).toArray();
    const mongoSharedBills = await db.collection('sharedBills').find({}).toArray();
    const mongoMemberBillPayments = await db.collection('memberBillPayments').find({}).toArray();
    const mongoRefundRequests = await db.collection('refundRequests').find({}).toArray();
    const mongoMonthlySummaries = await db.collection('monthlySummaries').find({}).toArray();
    const mongoSettingsList = await db.collection('settings').find({}).toArray();

    // Map _id of MongoDB to clean output, removing Mongo's internal ObjectId from the returned data
    const sanitizeDocs = (docs: any[]) => docs.map(({ _id, ...rest }) => rest);

    const users = sanitizeDocs(mongoUsers) as (User & { passwordHash: string })[];
    const menus = sanitizeDocs(mongoMenus) as MealMenu[];
    const records = sanitizeDocs(mongoRecords) as MealRecord[];
    const deposits = sanitizeDocs(mongoDeposits) as Deposit[];
    const bazaarAssignments = sanitizeDocs(mongoBazaarAssignments) as BazaarAssignment[];
    const bazaarExpenses = sanitizeDocs(mongoBazaarExpenses) as BazaarExpense[];
    const bazaarPairs = sanitizeDocs(mongoBazaarPairs) as BazaarPair[];
    const weeklyPayments = sanitizeDocs(mongoWeeklyPayments) as WeeklyPayment[];
    const contactMessages = sanitizeDocs(mongoContactMessages) as ContactMessage[];
    const sharedBills = sanitizeDocs(mongoSharedBills) as SharedBill[];
    const memberBillPayments = sanitizeDocs(mongoMemberBillPayments) as MemberBillPayment[];
    const refundRequests = sanitizeDocs(mongoRefundRequests) as RefundRequest[];
    const monthlySummaries = sanitizeDocs(mongoMonthlySummaries) as MonthlySummary[];
    
    let settings = DEFAULT_SETTINGS;
    if (mongoSettingsList.length > 0) {
      settings = sanitizeDocs(mongoSettingsList)[0] as SystemSettings;
    }

    if (users.length === 0) {
      console.log('MongoDB users collection is empty. Seeding default data...');
      const defaultData = initDb(); // Seeds local and returns it
      await seedMongo(defaultData);
      memoryDb = defaultData;
    } else {
      memoryDb = {
        users,
        menus,
        records,
        deposits,
        bazaarAssignments,
        bazaarExpenses,
        bazaarPairs,
        weeklyPayments,
        contactMessages,
        sharedBills,
        memberBillPayments,
        refundRequests,
        monthlySummaries,
        settings
      };
      console.log(`Loaded ${users.length} users, ${menus.length} menus, ${records.length} records, ${deposits.length} deposits from MongoDB.`);
    }
  } catch (error) {
    console.error('Failed to initialize MongoDB connection. Falling back to local db.json.', error);
    if (!fs.existsSync(DB_FILE)) {
      memoryDb = initDb();
    } else {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        memoryDb = JSON.parse(raw);
      } catch (err) {
        memoryDb = initDb();
      }
    }
  }
}

export function getDb(): DatabaseSchema {
  let res: DatabaseSchema;
  if (memoryDb) {
    res = memoryDb;
  } else if (!fs.existsSync(DB_FILE)) {
    res = initDb();
  } else {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      res = JSON.parse(raw);
    } catch (error) {
      console.error('Error reading database file, resetting to default.', error);
      res = initDb();
    }
  }

  // Ensure all arrays are initialized to prevent undefined crash
  res.users = res.users || [];
  res.menus = res.menus || [];
  res.records = res.records || [];
  res.deposits = res.deposits || [];
  res.bazaarAssignments = res.bazaarAssignments || [];
  res.bazaarExpenses = res.bazaarExpenses || [];
  res.bazaarPairs = res.bazaarPairs || [];
  res.weeklyPayments = res.weeklyPayments || [];
  res.contactMessages = res.contactMessages || [];
  res.sharedBills = res.sharedBills || [];
  res.memberBillPayments = res.memberBillPayments || [];
  res.refundRequests = res.refundRequests || [];
  res.monthlySummaries = res.monthlySummaries || [];
  res.mealToggleLog = res.mealToggleLog || [];
  res.adminChangeRequests = res.adminChangeRequests || [];
  res.settings = res.settings || DEFAULT_SETTINGS;
  if (typeof res.settings.currentPairIndex !== 'number') {
    res.settings.currentPairIndex = 0;
  }

  return res;
}

export function saveDb(data: DatabaseSchema): void {
  memoryDb = data;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing database file', error);
  }
  
  // Async sync to MongoDB
  syncToMongo(data).catch(err => {
    console.error('Error synchronizing database with MongoDB:', err);
  });
}

export function initDb(): DatabaseSchema {
  const defaultPasswordHash = bcrypt.hashSync('password123', 10);

  const initialData: DatabaseSchema = {
    users: [
      {
        id: 'user-admin',
        email: 'admin@familia.com',
        name: 'System Admin',
        phone: '01712345678',
        role: 'admin',
        status: 'approved',
        createdAt: new Date().toISOString(),
        passwordHash: defaultPasswordHash,
        bazaarCount: 0,
      },
      {
        id: 'user-developer',
        email: 'g.rabbi2005.555@gmail.com',
        name: 'Rabbi Developer',
        phone: '01812345678',
        role: 'admin',
        status: 'approved',
        createdAt: new Date().toISOString(),
        passwordHash: defaultPasswordHash,
        bazaarCount: 0,
      },
      {
        id: 'user-manager',
        email: 'manager@familia.com',
        name: 'Rahim Manager',
        phone: '01912345678',
        role: 'manager',
        status: 'approved',
        createdAt: new Date().toISOString(),
        passwordHash: defaultPasswordHash,
        bazaarCount: 0,
      },
      {
        id: 'user-member',
        email: 'member@familia.com',
        name: 'Karim Member',
        phone: '01512345678',
        role: 'member',
        status: 'approved',
        createdAt: new Date().toISOString(),
        passwordHash: defaultPasswordHash,
        bazaarCount: 1,
      },
      {
        id: 'user-guest',
        email: 'guest@familia.com',
        name: 'Sajal Guest',
        phone: '01612345678',
        status: 'pending',
        role: 'user',
        createdAt: new Date().toISOString(),
        passwordHash: defaultPasswordHash,
        bazaarCount: 0,
      },
    ],
    menus: [
      {
        id: 'menu-1',
        date: new Date().toISOString().split('T')[0],
        mealType: 'lunch',
        items: ['Steamed Rice', 'Beef Bhuna', 'Lentil Soup', 'Salad'],
        estimatedCost: 60,
      },
      {
        id: 'menu-2',
        date: new Date().toISOString().split('T')[0],
        mealType: 'dinner',
        items: ['Roti/Paratha', 'Chicken Curry', 'Dal Makhani'],
        estimatedCost: 50,
      },
    ],
    records: [
      {
        id: 'rec-1',
        userId: 'user-member',
        date: new Date().toISOString().split('T')[0],
        mealType: 'lunch',
        count: 1,
      },
      {
        id: 'rec-2',
        userId: 'user-member',
        date: new Date().toISOString().split('T')[0],
        mealType: 'dinner',
        count: 1,
      },
    ],          deposits: [
      {
        id: 'dep-1',
        userId: 'user-member',
        amount: 1500,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'bKash',
        transactionId: 'TRX99887766',
        status: 'approved',
        remarks: 'Monthly advanced meal fee',
      },
      {
        id: 'dep-2',
        userId: 'user-member',
        amount: 500,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        transactionId: 'CASH-001',
        status: 'pending',
        remarks: 'Extra money for dinner party',
      },
    ],
    bazaarPairs: [],
    bazaarAssignments: [
      {
        id: 'bazaar-1',
        userId: 'user-member',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        shoppingList: ['Rice - 5kg', 'Potato - 3kg', 'Onion - 2kg', 'Cooking Oil - 2L'],
        status: 'pending',
        bazaarPairId: 'pair-1',
      },
      {
        id: 'bazaar-2',
        userId: 'user-member',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        shoppingList: ['Chicken - 2kg', 'Beef - 1kg', 'Spices'],
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        bazaarPairId: 'pair-1',
      },
    ],
    bazaarExpenses: [
      {
        id: 'bexp-1',
        assignmentId: 'bazaar-2',
        userId: 'user-member',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: [
          { name: 'Chicken (2kg)', cost: 600 },
          { name: 'Beef (1kg)', cost: 750 },
          { name: 'Spices', cost: 200 },
        ],
        totalCost: 1550,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      },
    ],
    weeklyPayments: [],
    contactMessages: [],
    refundRequests: [],
    sharedBills: [
      {
        id: 'bill-rent-1',
        month: new Date().toISOString().slice(0, 7),
        type: 'rent',
        label: 'House Rent',
        totalAmount: 10000,
        dueDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'bill-elec-1',
        month: new Date().toISOString().slice(0, 7),
        type: 'electricity',
        label: 'Electricity Bill',
        totalAmount: 2000,
        dueDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'bill-wifi-1',
        month: new Date().toISOString().slice(0, 7),
        type: 'wifi',
        label: 'WiFi Bill',
        totalAmount: 1000,
        dueDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'bill-servant-1',
        month: new Date().toISOString().slice(0, 7),
        type: 'servant_fee',
        label: 'Servant Fee',
        totalAmount: 3000,
        dueDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      },
    ],
    memberBillPayments: [],
    monthlySummaries: [],
    settings: DEFAULT_SETTINGS,
  };

  // We also assign it to memoryDb so that we can query it immediately in memory
  memoryDb = initialData;

  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing database file', error);
  }

  return initialData;
}

let initPromise: Promise<void> | null = null;
export function ensureDbInit(): Promise<void> {
  if (!initPromise) {
    initPromise = initMongoConnection();
  }
  return initPromise;
}
