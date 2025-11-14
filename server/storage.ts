// Referenced from javascript_database and javascript_log_in_with_replit blueprints
import {
  users,
  transactions,
  airtimePlans,
  dataPlans,
  type User,
  type UpsertUser,
  type Transaction,
  type InsertTransaction,
  type AirtimePlan,
  type DataPlan,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Wallet operations
  updateWalletBalance(userId: string, newBalance: string): Promise<void>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string): Promise<Transaction[]>;
  getRecentTransactions(userId: string, limit: number): Promise<Transaction[]>;
  
  // Airtime plans
  getAirtimePlans(): Promise<AirtimePlan[]>;
  
  // Data plans
  getDataPlans(): Promise<DataPlan[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Wallet operations
  async updateWalletBalance(userId: string, newBalance: string): Promise<void> {
    await db
      .update(users)
      .set({ walletBalance: newBalance, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  // Transaction operations
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  async getRecentTransactions(userId: string, limit: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  // Airtime plans
  async getAirtimePlans(): Promise<AirtimePlan[]> {
    return await db
      .select()
      .from(airtimePlans)
      .where(eq(airtimePlans.isActive, 1));
  }

  // Data plans
  async getDataPlans(): Promise<DataPlan[]> {
    return await db
      .select()
      .from(dataPlans)
      .where(eq(dataPlans.isActive, 1));
  }
}

export const storage = new DatabaseStorage();
