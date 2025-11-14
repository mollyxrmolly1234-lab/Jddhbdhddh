import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  phoneNumber: text("phone_number").notNull().unique(),
  password: text("password").notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default("0.00"),
  referralCode: text("referral_code").notNull().unique(),
  referredBy: text("referred_by"),
  referralCount: integer("referral_count").notNull().default(0),
  referralEarnings: decimal("referral_earnings", { precision: 10, scale: 2 }).notNull().default("0.00"),
  telegramVerified: boolean("telegram_verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions),
  dataPurchases: many(dataPurchases),
  airtimePurchases: many(airtimePurchases),
  fundingRequests: many(fundingRequests),
}));

// Admin accounts (separate from users)
export const admins = pgTable("admins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Payment settings (updatable by admin)
export const paymentSettings = pgTable("payment_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountNumber: text("account_number").notNull(),
  bankName: text("bank_name").notNull(),
  accountName: text("account_name").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Funding requests
export const fundingRequests = pgTable("funding_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, confirmed, rejected
  createdAt: timestamp("created_at").notNull().defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
  confirmedBy: text("confirmed_by").references(() => admins.id),
});

export const fundingRequestsRelations = relations(fundingRequests, ({ one }) => ({
  user: one(users, {
    fields: [fundingRequests.userId],
    references: [users.id],
  }),
}));

// Transactions (general ledger)
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // funding, data_purchase, airtime_purchase, referral_bonus
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  balanceBefore: decimal("balance_before", { precision: 10, scale: 2 }).notNull(),
  balanceAfter: decimal("balance_after", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

// Data bundles catalog
export const dataBundles = pgTable("data_bundles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  network: text("network").notNull(), // MTN, Glo, Airtel, 9mobile
  dataAmount: text("data_amount").notNull(), // e.g., "1GB", "2GB", "5GB"
  validity: text("validity").notNull(), // e.g., "30 days", "7 days"
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

// Data purchases
export const dataPurchases = pgTable("data_purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => users.id),
  bundleId: text("bundle_id").notNull().references(() => dataBundles.id),
  phoneNumber: text("phone_number").notNull(),
  network: text("network").notNull(),
  dataAmount: text("data_amount").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("completed"), // completed, failed
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const dataPurchasesRelations = relations(dataPurchases, ({ one }) => ({
  user: one(users, {
    fields: [dataPurchases.userId],
    references: [users.id],
  }),
  bundle: one(dataBundles, {
    fields: [dataPurchases.bundleId],
    references: [dataBundles.id],
  }),
}));

// Airtime purchases
export const airtimePurchases = pgTable("airtime_purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => users.id),
  phoneNumber: text("phone_number").notNull(),
  network: text("network").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("completed"), // completed, failed
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const airtimePurchasesRelations = relations(airtimePurchases, ({ one }) => ({
  user: one(users, {
    fields: [airtimePurchases.userId],
    references: [users.id],
  }),
}));

// Telegram OTP storage
export const telegramOtps = pgTable("telegram_otps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneNumber: text("phone_number").notNull().unique(),
  otp: text("otp").notNull(),
  telegramChatId: text("telegram_chat_id"),
  expiresAt: timestamp("expires_at").notNull(),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  balance: true,
  referralCode: true,
  referralCount: true,
  referralEarnings: true,
  telegramVerified: true,
  createdAt: true,
}).extend({
  phoneNumber: z.string().regex(/^\+234\d{10}$/, "Phone number must be in format +234XXXXXXXXXX"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSettingsSchema = createInsertSchema(paymentSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertFundingRequestSchema = createInsertSchema(fundingRequests).omit({
  id: true,
  status: true,
  createdAt: true,
  confirmedAt: true,
  confirmedBy: true,
}).extend({
  amount: z.number().min(1000, "Minimum deposit is 1000 NGN"),
});

export const insertDataPurchaseSchema = createInsertSchema(dataPurchases).omit({
  id: true,
  status: true,
  createdAt: true,
}).extend({
  phoneNumber: z.string().regex(/^\+234\d{10}$/, "Phone number must be in format +234XXXXXXXXXX"),
});

export const insertAirtimePurchaseSchema = createInsertSchema(airtimePurchases).omit({
  id: true,
  status: true,
  createdAt: true,
}).extend({
  phoneNumber: z.string().regex(/^\+234\d{10}$/, "Phone number must be in format +234XXXXXXXXXX"),
  amount: z.number().min(50, "Minimum airtime amount is 50 NGN"),
});

export const insertDataBundleSchema = createInsertSchema(dataBundles).omit({
  id: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type PaymentSettings = typeof paymentSettings.$inferSelect;
export type InsertPaymentSettings = z.infer<typeof insertPaymentSettingsSchema>;
export type FundingRequest = typeof fundingRequests.$inferSelect;
export type InsertFundingRequest = z.infer<typeof insertFundingRequestSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type DataBundle = typeof dataBundles.$inferSelect;
export type InsertDataBundle = z.infer<typeof insertDataBundleSchema>;
export type DataPurchase = typeof dataPurchases.$inferSelect;
export type InsertDataPurchase = z.infer<typeof insertDataPurchaseSchema>;
export type AirtimePurchase = typeof airtimePurchases.$inferSelect;
export type InsertAirtimePurchase = z.infer<typeof insertAirtimePurchaseSchema>;
export type TelegramOtp = typeof telegramOtps.$inferSelect;
