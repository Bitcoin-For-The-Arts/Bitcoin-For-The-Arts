import { MongoClient, type Db } from 'mongodb';

declare global {
  var __mongoClientPromise: Promise<MongoClient> | undefined;
  var __mongoIndexesEnsured: boolean | undefined;
}

function getMongoUri() {
  const uri = process.env.MONGODB_URI;
  if (!uri || !uri.trim()) {
    throw new Error('Missing MONGODB_URI environment variable.');
  }
  return uri.trim();
}

export async function getMongoClient() {
  if (global.__mongoClientPromise) return global.__mongoClientPromise;
  const client = new MongoClient(getMongoUri());
  global.__mongoClientPromise = client.connect();
  return global.__mongoClientPromise;
}

async function ensureIndexes(db: Db) {
  if (global.__mongoIndexesEnsured) return;
  global.__mongoIndexesEnsured = true;
  try {
    await Promise.allSettled([
      db.collection('applications').createIndex({ status: 1, createdAt: -1 }),
      db.collection('applications').createIndex({ email: 1 }),
      db.collection('donations').createIndex({ createdAt: -1 }),
      db.collection('donations').createIndex({ stripeSessionId: 1 }, { unique: true, sparse: true }),
      db.collection('btcpayDonations').createIndex({ createdAt: -1 }),
      db.collection('volunteers').createIndex({ createdAt: -1 }),
      db.collection('newsletterSignups').createIndex({ email: 1 }, { unique: true }),
      db.collection('feedback').createIndex({ createdAt: -1 }),
      db.collection('boardNominations').createIndex({ createdAt: -1 }),
      db.collection('educationInterest').createIndex({ createdAt: -1 }),
      db.collection('billingPortalTokens').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    ]);
  } catch {
    // Non-fatal: indexes are a performance optimization
  }
}

export async function getMongoDb() {
  const client = await getMongoClient();
  const name = (process.env.MONGODB_DB ?? 'bitcoinforthearts').trim();
  const db = client.db(name);
  await ensureIndexes(db);
  return db;
}

