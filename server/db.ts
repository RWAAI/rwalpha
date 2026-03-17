import { desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  InsertNavHistory, navHistory,
  InsertDividendRecord, dividendRecords,
  InsertAiSignal, aiSignals,
  InsertRebalanceLog, rebalanceLogs,
  InsertPortfolio, portfolios,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── User helpers ─────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── NAV History helpers ──────────────────────────────────────────────────────

export async function insertNavHistory(record: InsertNavHistory) {
  const db = await getDb();
  if (!db) return;
  await db.insert(navHistory).values(record);
}

export async function getNavHistory(limit = 90) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(navHistory).orderBy(desc(navHistory.date)).limit(limit);
}

export async function bulkInsertNavHistory(records: InsertNavHistory[]) {
  const db = await getDb();
  if (!db) return 0;
  if (records.length === 0) return 0;
  // Insert in batches of 100
  const batchSize = 100;
  let inserted = 0;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    await db.insert(navHistory).values(batch).onDuplicateKeyUpdate({ set: { navValue: sql`VALUES(navValue)` } });
    inserted += batch.length;
  }
  return inserted;
}

// ─── Dividend Record helpers ──────────────────────────────────────────────────

export async function insertDividendRecord(record: InsertDividendRecord) {
  const db = await getDb();
  if (!db) return;
  await db.insert(dividendRecords).values(record);
}

export async function getDividendRecords(limit = 52) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(dividendRecords).orderBy(desc(dividendRecords.date)).limit(limit);
}

export async function bulkInsertDividendRecords(records: InsertDividendRecord[]) {
  const db = await getDb();
  if (!db) return 0;
  if (records.length === 0) return 0;
  const batchSize = 100;
  let inserted = 0;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    await db.insert(dividendRecords).values(batch).onDuplicateKeyUpdate({ set: { amountPerUnit: sql`VALUES(amountPerUnit)` } });
    inserted += batch.length;
  }
  return inserted;
}

// ─── AI Signal helpers ────────────────────────────────────────────────────────

export async function insertAiSignal(signal: InsertAiSignal) {
  const db = await getDb();
  if (!db) return;
  await db.insert(aiSignals).values(signal);
}

export async function getLatestAiSignal() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(aiSignals).orderBy(desc(aiSignals.signalDate)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// ─── Rebalance Log helpers ────────────────────────────────────────────────────

export async function insertRebalanceLog(log: InsertRebalanceLog) {
  const db = await getDb();
  if (!db) return;
  await db.insert(rebalanceLogs).values(log);
}

export async function getRebalanceLogs(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(rebalanceLogs).orderBy(desc(rebalanceLogs.actionDate)).limit(limit);
}

// ─── Delete helpers ───────────────────────────────────────────────────────────

export async function deleteNavHistory(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(navHistory).where(eq(navHistory.id, id));
}

export async function deleteDividendRecord(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(dividendRecords).where(eq(dividendRecords.id, id));
}

export async function deleteRebalanceLog(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(rebalanceLogs).where(eq(rebalanceLogs.id, id));
}

// ─── Portfolio helpers ────────────────────────────────────────────────────────

export async function getAllPortfolios() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(portfolios).orderBy(desc(portfolios.updatedAt));
}

export async function getPortfolioById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(portfolios).where(eq(portfolios.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function insertPortfolio(record: InsertPortfolio) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(portfolios).values(record);
  return result;
}

export async function updatePortfolio(id: number, data: Partial<InsertPortfolio>) {
  const db = await getDb();
  if (!db) return;
  await db.update(portfolios).set(data).where(eq(portfolios.id, id));
}

export async function deletePortfolio(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(portfolios).where(eq(portfolios.id, id));
}

// ─── KYC helpers ─────────────────────────────────────────────────────────────

import {
  kycRecords, InsertKycRecord,
  walletBindings, InsertWalletBinding,
  userHoldings, InsertUserHolding,
  userDividendHistory, InsertUserDividendHistory,
} from "../drizzle/schema";

export async function getKycByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(kycRecords).where(eq(kycRecords.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function upsertKyc(userId: number, data: Partial<InsertKycRecord>) {
  const db = await getDb();
  if (!db) return;
  const existing = await getKycByUserId(userId);
  if (existing) {
    await db.update(kycRecords).set({ ...data, updatedAt: new Date() }).where(eq(kycRecords.userId, userId));
  } else {
    await db.insert(kycRecords).values({ userId, ...data } as InsertKycRecord);
  }
}

// ─── Wallet Binding helpers ───────────────────────────────────────────────────

export async function getWalletsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(walletBindings).where(eq(walletBindings.userId, userId)).orderBy(desc(walletBindings.createdAt));
}

export async function addWalletBinding(data: InsertWalletBinding) {
  const db = await getDb();
  if (!db) return;
  await db.insert(walletBindings).values(data);
}

export async function deleteWalletBinding(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(walletBindings).where(eq(walletBindings.id, id));
}

export async function setPrimaryWallet(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  // Clear all primary flags for this user
  await db.update(walletBindings).set({ isPrimary: 0 }).where(eq(walletBindings.userId, userId));
  // Set the selected one as primary
  await db.update(walletBindings).set({ isPrimary: 1 }).where(eq(walletBindings.id, id));
}

// ─── User Holdings helpers ────────────────────────────────────────────────────

export async function getHoldingsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userHoldings).where(eq(userHoldings.userId, userId)).orderBy(desc(userHoldings.totalValue));
}

export async function upsertHolding(userId: number, tokenSymbol: string, data: Partial<InsertUserHolding>) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(userHoldings)
    .where(eq(userHoldings.userId, userId))
    .limit(1);
  const match = existing.find(h => h.tokenSymbol === tokenSymbol);
  if (match) {
    await db.update(userHoldings).set(data).where(eq(userHoldings.id, match.id));
  } else {
    await db.insert(userHoldings).values({ userId, tokenSymbol, quantity: "0", ...data } as InsertUserHolding);
  }
}

// ─── User Dividend History helpers ───────────────────────────────────────────

export async function getDividendHistoryByUserId(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userDividendHistory)
    .where(eq(userDividendHistory.userId, userId))
    .orderBy(desc(userDividendHistory.date))
    .limit(limit);
}

export async function insertUserDividend(data: InsertUserDividendHistory) {
  const db = await getDb();
  if (!db) return;
  await db.insert(userDividendHistory).values(data);
}

export async function claimDividend(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(userDividendHistory)
    .set({ status: "claimed", claimedAt: new Date() })
    .where(eq(userDividendHistory.id, id));
}
