// Referenced from javascript_log_in_with_replit and javascript_database blueprints
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  decimal,
  text,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table (required for Replit Auth) with wallet balance
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  walletBalance: decimal("wallet_balance", { precision: 12, scale: 2 }).notNull().default('0.00'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions),
}));

// Transactions table (wallet funding, airtime, data purchases)
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // 'funding', 'airtime', 'data'
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  status: varchar("status").notNull().default('pending'), // 'pending', 'completed', 'failed'
  description: text("description").notNull(),
  metadata: jsonb("metadata"), // Store additional data like network, phone number, plan details
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

// Airtime plans
export const airtimePlans = pgTable("airtime_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  network: varchar("network").notNull(), // 'MTN', 'Glo', 'Airtel', '9mobile'
  amount: integer("amount").notNull(), // Amount in Naira (100, 200, 500, etc.)
  price: decimal("price", { precision: 12, scale: 2 }).notNull(), // Discounted price
  discount: integer("discount").notNull().default(0), // Discount percentage
  isActive: integer("is_active").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// Data plans (SME, Direct, Gifting, Corporate Gifting)
export const dataPlans = pgTable("data_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  network: varchar("network").notNull(), // 'MTN', 'Glo', 'Airtel', '9mobile'
  category: varchar("category").notNull(), // 'SME', 'Direct Data', 'Gifting', 'Corporate Gifting'
  size: varchar("size").notNull(), // '500MB', '1GB', '2GB', etc.
  sizeInMB: integer("size_in_mb").notNull(), // For sorting
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  validity: varchar("validity").notNull(), // '30 days', '7 days', etc.
  discount: integer("discount").notNull().default(0), // Discount percentage
  isBestValue: integer("is_best_value").notNull().default(0),
  isMostPopular: integer("is_most_popular").notNull().default(0),
  isActive: integer("is_active").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas and types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type AirtimePlan = typeof airtimePlans.$inferSelect;
export type DataPlan = typeof dataPlans.$inferSelect;

// Fund wallet schema
export const fundWalletSchema = z.object({
  amount: z.number().min(1000, "Minimum funding is ₦1,000"),
});
export type FundWallet = z.infer<typeof fundWalletSchema>;

// Purchase airtime schema
export const purchaseAirtimeSchema = z.object({
  network: z.enum(['MTN', 'Glo', 'Airtel', '9mobile']),
  phoneNumber: z.string().min(11, "Phone number must be 11 digits").max(11, "Phone number must be 11 digits"),
  amount: z.number().min(50, "Minimum airtime is ₦50"),
});
export type PurchaseAirtime = z.infer<typeof purchaseAirtimeSchema>;

// Purchase data schema
export const purchaseDataSchema = z.object({
  planId: z.string(),
  phoneNumber: z.string().min(11, "Phone number must be 11 digits").max(11, "Phone number must be 11 digits"),
});
export type PurchaseData = z.infer<typeof purchaseDataSchema>;
