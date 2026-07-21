import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';
import { User, MealMenu, MealRecord, Deposit, SystemSettings } from '../types.js';

export interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  menus: MealMenu[];
  records: MealRecord[];
  deposits: Deposit[];
  settings: SystemSettings;
}

const DB_FILE = path.join(process.cwd(), 'db.json');

const DEFAULT_SETTINGS: SystemSettings = {
  mealRate: 45, // Default meal rate of 45 currency units
};

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://power-point-famila:MhyloARZhkNmRpwU@mrcluster.zsepnby.mongodb.net/?appName=MRcluster';
const DB_NAME = 'Power-Point-Famila';

let client: MongoClient | null = null;
let dbInstance: any = null;
let memoryDb: DatabaseSchema | null = null;

export async function getMongoClient() {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
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
    
    // 1. Upsert all current local items
    for (const item of localItems) {
      await col.replaceOne({ id: item.id }, item, { upsert: true });
    }
    
    // 2. Delete any items in Mongo that are no longer in local items
    const localIds = localItems.map(item => item.id);
    await col.deleteMany({ id: { $nin: localIds } });
  } catch (error) {
    console.error(`Error syncing collection ${colName}:`, error);
    throw error;
  }
}

async function syncSettings(settings: SystemSettings) {
  try {
    const db = await getMongoClient();
    const col = db.collection('settings');
    await col.replaceOne({}, settings, { upsert: true });
  } catch (error) {
    console.error('Error syncing settings:', error);
    throw error;
  }
}

export async function seedMongo(data: DatabaseSchema): Promise<void> {
  try {
    const db = await getMongoClient();
    
    // Insert initial users
    if (data.users.length > 0) {
      await db.collection('users').insertMany(data.users);
    }
    // Insert initial menus
    if (data.menus.length > 0) {
      await db.collection('menus').insertMany(data.menus);
    }
    // Insert initial records
    if (data.records.length > 0) {
      await db.collection('records').insertMany(data.records);
    }
    // Insert initial deposits
    if (data.deposits.length > 0) {
      await db.collection('deposits').insertMany(data.deposits);
    }
    // Insert initial settings
    await db.collection('settings').insertOne(data.settings);
    
    console.log('Seeded default data successfully to MongoDB.');
  } catch (error) {
    console.error('Error seeding default data to MongoDB:', error);
  }
}

export async function syncToMongo(data: DatabaseSchema): Promise<void> {
  try {
    await syncCollection('users', data.users);
    await syncCollection('menus', data.menus);
    await syncCollection('records', data.records);
    await syncCollection('deposits', data.deposits);
    await syncSettings(data.settings);
    console.log('Successfully synchronized database changes to MongoDB.');
  } catch (error) {
    console.error('Failed to synchronize database with MongoDB:', error);
  }
}

export async function initMongoConnection(): Promise<void> {
  try {
    const db = await getMongoClient();
    
    const mongoUsers = await db.collection('users').find({}).toArray();
    const mongoMenus = await db.collection('menus').find({}).toArray();
    const mongoRecords = await db.collection('records').find({}).toArray();
    const mongoDeposits = await db.collection('deposits').find({}).toArray();
    const mongoSettingsList = await db.collection('settings').find({}).toArray();

    // Map _id of MongoDB to clean output, removing Mongo's internal ObjectId from the returned data
    const sanitizeDocs = (docs: any[]) => docs.map(({ _id, ...rest }) => rest);

    const users = sanitizeDocs(mongoUsers) as (User & { passwordHash: string })[];
    const menus = sanitizeDocs(mongoMenus) as MealMenu[];
    const records = sanitizeDocs(mongoRecords) as MealRecord[];
    const deposits = sanitizeDocs(mongoDeposits) as Deposit[];
    
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
  if (memoryDb) {
    return memoryDb;
  }
  if (!fs.existsSync(DB_FILE)) {
    return initDb();
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading database file, resetting to default.', error);
    return initDb();
  }
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
      },
      {
        id: 'user-guest',
        email: 'guest@familia.com',
        name: 'Sajal Guest',
        phone: '01612345678',
        role: 'user',
        status: 'pending',
        createdAt: new Date().toISOString(),
        passwordHash: defaultPasswordHash,
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
    ],
    deposits: [
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
