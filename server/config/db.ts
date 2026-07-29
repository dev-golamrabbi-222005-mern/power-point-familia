import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';
import { User, MealMenu, MealRecord, Deposit, SystemSettings, BazaarAssignment, BazaarExpense, BazaarPair, WeeklyPayment, ContactMessage, SharedBill, MemberBillPayment, RefundRequest, MonthlySummary, MealToggleLog, AdminChangeRequest } from '../../src/types';

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

export async function connectMongo() {
  if (dbInstance) return dbInstance;
  if (!MONGODB_URI) return null;
  try {
    if (!client) {
      client = new MongoClient(MONGODB_URI);
      await client.connect();
    }
    dbInstance = client.db(DB_NAME);
    return dbInstance;
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
    return null;
  }
}

export function getInitialDb(): DatabaseSchema {
  const initialUser: User & { passwordHash: string } = {
    id: 'user_admin_001',
    email: 'admin@familia.com',
    name: 'System Admin',
    phone: '+8801700000000',
    role: 'admin',
    status: 'approved',
    createdAt: new Date().toISOString(),
    passwordHash: bcrypt.hashSync('admin123', 10),
    bazaarCount: 0,
  };

  return {
    users: [initialUser],
    menus: [],
    records: [],
    deposits: [],
    bazaarAssignments: [],
    bazaarExpenses: [],
    bazaarPairs: [],
    weeklyPayments: [],
    contactMessages: [],
    sharedBills: [],
    memberBillPayments: [],
    refundRequests: [],
    monthlySummaries: [],
    mealToggleLog: [],
    adminChangeRequests: [],
    settings: DEFAULT_SETTINGS,
  };
}

export function getDb(): DatabaseSchema {
  if (memoryDb) return memoryDb;

  if (!fs.existsSync(DB_FILE)) {
    const initialData = getInitialDb();
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    memoryDb = initialData;
    return memoryDb;
  }

  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    memoryDb = {
      ...parsed,
      mealToggleLog: parsed.mealToggleLog || [],
      adminChangeRequests: parsed.adminChangeRequests || [],
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
    };
    return memoryDb!;
  } catch (e) {
    console.error('Error reading JSON DB file:', e);
    memoryDb = getInitialDb();
    return memoryDb!;
  }
}

export async function ensureDbInit(): Promise<DatabaseSchema> {
  const db = await connectMongo();

  if (db) {
    try {
      const usersCol = db.collection('users');
      const menusCol = db.collection('menus');
      const recordsCol = db.collection('records');
      const depositsCol = db.collection('deposits');
      const bazaarAssignmentsCol = db.collection('bazaarAssignments');
      const bazaarExpensesCol = db.collection('bazaarExpenses');
      const bazaarPairsCol = db.collection('bazaarPairs');
      const weeklyPaymentsCol = db.collection('weeklyPayments');
      const contactMessagesCol = db.collection('contactMessages');
      const sharedBillsCol = db.collection('sharedBills');
      const memberBillPaymentsCol = db.collection('memberBillPayments');
      const refundRequestsCol = db.collection('refundRequests');
      const monthlySummariesCol = db.collection('monthlySummaries');
      const mealToggleLogCol = db.collection('mealToggleLog');
      const adminChangeRequestsCol = db.collection('adminChangeRequests');
      const settingsCol = db.collection('settings');

      const usersCount = await usersCol.countDocuments();
      if (usersCount === 0) {
        const initData = getInitialDb();
        await usersCol.insertMany(initData.users);
        await settingsCol.insertOne({ ...initData.settings, _id: 'global_settings' as any });
      }

      const users = await usersCol.find({}).toArray();
      const menus = await menusCol.find({}).toArray();
      const records = await recordsCol.find({}).toArray();
      const deposits = await depositsCol.find({}).toArray();
      const bazaarAssignments = await bazaarAssignmentsCol.find({}).toArray();
      const bazaarExpenses = await bazaarExpensesCol.find({}).toArray();
      const bazaarPairs = await bazaarPairsCol.find({}).toArray();
      const weeklyPayments = await weeklyPaymentsCol.find({}).toArray();
      const contactMessages = await contactMessagesCol.find({}).toArray();
      const sharedBills = await sharedBillsCol.find({}).toArray();
      const memberBillPayments = await memberBillPaymentsCol.find({}).toArray();
      const refundRequests = await refundRequestsCol.find({}).toArray();
      const monthlySummaries = await monthlySummariesCol.find({}).toArray();
      const mealToggleLog = await mealToggleLogCol.find({}).toArray();
      const adminChangeRequests = await adminChangeRequestsCol.find({}).toArray();

      const settingsDoc = await settingsCol.findOne({ _id: 'global_settings' as any });
      const settings = settingsDoc ? { ...DEFAULT_SETTINGS, ...settingsDoc } : DEFAULT_SETTINGS;

      const formatDoc = (doc: any) => {
        if (!doc) return doc;
        const { _id, ...rest } = doc;
        return { id: doc.id || (_id ? _id.toString() : undefined), ...rest };
      };

      memoryDb = {
        users: users.map(formatDoc),
        menus: menus.map(formatDoc),
        records: records.map(formatDoc),
        deposits: deposits.map(formatDoc),
        bazaarAssignments: bazaarAssignments.map(formatDoc),
        bazaarExpenses: bazaarExpenses.map(formatDoc),
        bazaarPairs: bazaarPairs.map(formatDoc),
        weeklyPayments: weeklyPayments.map(formatDoc),
        contactMessages: contactMessages.map(formatDoc),
        sharedBills: sharedBills.map(formatDoc),
        memberBillPayments: memberBillPayments.map(formatDoc),
        refundRequests: refundRequests.map(formatDoc),
        monthlySummaries: monthlySummaries.map(formatDoc),
        mealToggleLog: mealToggleLog.map(formatDoc),
        adminChangeRequests: adminChangeRequests.map(formatDoc),
        settings,
      };
      return memoryDb!;
    } catch (err) {
      console.error('Failed reading from MongoDB, falling back to FS/Memory:', err);
    }
  }

  return getDb();
}

export async function saveDb(data: DatabaseSchema): Promise<void> {
  memoryDb = data;

  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed writing to DB file:', err);
  }

  const db = await connectMongo();
  if (db) {
    try {
      const syncCollection = async (name: string, items: any[]) => {
        const col = db.collection(name);
        await col.deleteMany({});
        if (items && items.length > 0) {
          const docs = items.map((item) => {
            const { id, ...rest } = item;
            return { _id: id || item._id, id, ...rest };
          });
          await col.insertMany(docs);
        }
      };

      await syncCollection('users', data.users);
      await syncCollection('menus', data.menus);
      await syncCollection('records', data.records);
      await syncCollection('deposits', data.deposits);
      await syncCollection('bazaarAssignments', data.bazaarAssignments);
      await syncCollection('bazaarExpenses', data.bazaarExpenses);
      await syncCollection('bazaarPairs', data.bazaarPairs);
      await syncCollection('weeklyPayments', data.weeklyPayments);
      await syncCollection('contactMessages', data.contactMessages);
      await syncCollection('sharedBills', data.sharedBills);
      await syncCollection('memberBillPayments', data.memberBillPayments);
      await syncCollection('refundRequests', data.refundRequests);
      await syncCollection('monthlySummaries', data.monthlySummaries);
      await syncCollection('mealToggleLog', data.mealToggleLog || []);
      await syncCollection('adminChangeRequests', data.adminChangeRequests || []);

      const settingsCol = db.collection('settings');
      await settingsCol.replaceOne(
        { _id: 'global_settings' as any },
        { _id: 'global_settings' as any, ...data.settings },
        { upsert: true }
      );
    } catch (err) {
      console.error('Failed syncing to MongoDB:', err);
    }
  }
}
