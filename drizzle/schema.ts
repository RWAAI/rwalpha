import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 金库 NAV 历史记录
 * 每日记录金库净值，用于绘制 NAV 走势图
 */
export const navHistory = mysqlTable("nav_history", {
  id: int("id").autoincrement().primaryKey(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  navValue: decimal("navValue", { precision: 12, scale: 4 }).notNull(),
  totalReturn: decimal("totalReturn", { precision: 8, scale: 4 }), // % 相对基准 $100
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NavHistory = typeof navHistory.$inferSelect;
export type InsertNavHistory = typeof navHistory.$inferInsert;

/**
 * 派息记录
 * 每周/每月派息到账记录
 */
export const dividendRecords = mysqlTable("dividend_records", {
  id: int("id").autoincrement().primaryKey(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  ticker: varchar("ticker", { length: 16 }).notNull(), // NVDY / QQQI
  amountPerUnit: decimal("amountPerUnit", { precision: 12, scale: 6 }).notNull(), // 每单位派息
  totalAmount: decimal("totalAmount", { precision: 16, scale: 4 }), // 本次总派息（示例值）
  frequency: varchar("frequency", { length: 16 }).notNull(), // Weekly / Monthly
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DividendRecord = typeof dividendRecords.$inferSelect;
export type InsertDividendRecord = typeof dividendRecords.$inferInsert;

/**
 * AI 市场信号快照
 * 每次 AI 分析后持久化信号结果
 */
export const aiSignals = mysqlTable("ai_signals", {
  id: int("id").autoincrement().primaryKey(),
  signalDate: timestamp("signalDate").notNull(),
  marketSentiment: varchar("marketSentiment", { length: 64 }),
  nvdyVolRisk: varchar("nvdyVolRisk", { length: 64 }),
  qqqiPremium: varchar("qqqiPremium", { length: 64 }),
  qqqmVgtMomentum: varchar("qqqmVgtMomentum", { length: 64 }),
  rebalanceSignal: varchar("rebalanceSignal", { length: 64 }),
  rawJson: text("rawJson"), // 完整 JSON 快照
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiSignal = typeof aiSignals.$inferSelect;
export type InsertAiSignal = typeof aiSignals.$inferInsert;

/**
 * AI 调仓日志
 * 记录每次 AI 触发的调仓操作
 */
export const rebalanceLogs = mysqlTable("rebalance_logs", {
  id: int("id").autoincrement().primaryKey(),
  actionDate: varchar("actionDate", { length: 10 }).notNull(), // YYYY-MM-DD
  icon: varchar("icon", { length: 8 }),
  action: text("action").notNull(), // 调仓描述
  tag: varchar("tag", { length: 32 }).notNull(), // 调仓 / 再投资 / 风控
  tagEn: varchar("tagEn", { length: 32 }), // Rebalance / Reinvest / Risk Ctrl
  actionEn: text("actionEn"), // 英文描述
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RebalanceLog = typeof rebalanceLogs.$inferSelect;
export type InsertRebalanceLog = typeof rebalanceLogs.$inferInsert;

/**
 * AI 看板用户自定义组合
 * 存储用户创建的 ETF/股票组合
 */
export const portfolios = mysqlTable("portfolios", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 64 }).notNull(),
  nameEn: varchar("nameEn", { length: 128 }),       // AI-translated English name
  description: text("description"),
  descriptionEn: text("descriptionEn"),              // AI-translated English description
  tickers: text("tickers").notNull(), // JSON array: [{ticker, weight, name?}]
  cachedData: text("cachedData"),     // JSON: cached market data
  cachedAt: timestamp("cachedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Portfolio = typeof portfolios.$inferSelect;
export type InsertPortfolio = typeof portfolios.$inferInsert;

/**
 * 用户 KYC 认证记录
 */
export const kycRecords = mysqlTable("kyc_records", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  status: mysqlEnum("status", ["pending", "submitted", "approved", "rejected"]).default("pending").notNull(),
  fullName: varchar("fullName", { length: 128 }),
  idType: varchar("idType", { length: 32 }), // passport / id_card / driver_license
  idNumber: varchar("idNumber", { length: 64 }),
  country: varchar("country", { length: 64 }),
  dateOfBirth: varchar("dateOfBirth", { length: 10 }), // YYYY-MM-DD
  submittedAt: timestamp("submittedAt"),
  reviewedAt: timestamp("reviewedAt"),
  rejectReason: text("rejectReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type KycRecord = typeof kycRecords.$inferSelect;
export type InsertKycRecord = typeof kycRecords.$inferInsert;

/**
 * 用户绑定的钱包地址
 */
export const walletBindings = mysqlTable("wallet_bindings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  address: varchar("address", { length: 128 }).notNull(),
  chain: varchar("chain", { length: 32 }).notNull().default("Ethereum"), // Ethereum / BSC / Polygon
  label: varchar("label", { length: 64 }), // 用户自定义备注
  isPrimary: int("isPrimary").default(0).notNull(), // 1 = 主钱包
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WalletBinding = typeof walletBindings.$inferSelect;
export type InsertWalletBinding = typeof walletBindings.$inferInsert;

/**
 * 用户资产持仓（本金金库）
 */
export const userHoldings = mysqlTable("user_holdings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tokenSymbol: varchar("tokenSymbol", { length: 32 }).notNull(), // rINDEX / rFCN 等
  quantity: decimal("quantity", { precision: 20, scale: 6 }).notNull().default("0"),
  navPerToken: decimal("navPerToken", { precision: 12, scale: 4 }),
  totalValue: decimal("totalValue", { precision: 20, scale: 4 }),
  change24h: decimal("change24h", { precision: 8, scale: 4 }), // % 24h 变动
  totalReturn: decimal("totalReturn", { precision: 8, scale: 4 }), // % 含股息总回报
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserHolding = typeof userHoldings.$inferSelect;
export type InsertUserHolding = typeof userHoldings.$inferInsert;

/**
 * 用户派息历史（收益金库）
 */
export const userDividendHistory = mysqlTable("user_dividend_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  tokenSymbol: varchar("tokenSymbol", { length: 32 }).notNull(),
  amount: decimal("amount", { precision: 16, scale: 4 }).notNull(), // USDT 金额
  amountPerToken: decimal("amountPerToken", { precision: 12, scale: 6 }),
  status: mysqlEnum("status", ["pending", "claimable", "claimed"]).default("claimable").notNull(),
  claimedAt: timestamp("claimedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserDividendHistory = typeof userDividendHistory.$inferSelect;
export type InsertUserDividendHistory = typeof userDividendHistory.$inferInsert;
