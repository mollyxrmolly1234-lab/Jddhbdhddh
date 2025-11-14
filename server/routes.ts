// Referenced from javascript_log_in_with_replit blueprint
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { fundWalletSchema, purchaseAirtimeSchema, purchaseDataSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Wallet routes
  app.post('/api/wallet/fund', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { amount } = fundWalletSchema.parse(req.body);

      // Create pending transaction
      const transaction = await storage.createTransaction({
        userId,
        type: 'funding',
        amount: amount.toString(),
        status: 'pending',
        description: `Wallet Funding - ₦${amount.toLocaleString('en-NG')}`,
        metadata: {
          paymentMethod: 'OPAY',
          accountNumber: '8168877628',
          accountName: 'ABOSEDE AJAYI'
        }
      });

      res.json({ 
        success: true, 
        transaction,
        message: "Payment initiated. Please transfer to the provided account." 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error funding wallet:", error);
      res.status(500).json({ message: "Failed to initiate funding" });
    }
  });

  app.post('/api/wallet/confirm', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { amount } = fundWalletSchema.parse(req.body);

      // In a real app, you would verify the payment here
      // For now, we'll simulate automatic confirmation
      
      // Get current user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update wallet balance
      const currentBalance = parseFloat(user.walletBalance);
      const newBalance = currentBalance + amount;
      await storage.updateWalletBalance(userId, newBalance.toFixed(2));

      // Create completed transaction
      await storage.createTransaction({
        userId,
        type: 'funding',
        amount: amount.toString(),
        status: 'completed',
        description: `Wallet Funding - ₦${amount.toLocaleString('en-NG')}`,
        metadata: {
          paymentMethod: 'OPAY',
          accountNumber: '8168877628',
          accountName: 'ABOSEDE AJAYI'
        }
      });

      res.json({ 
        success: true, 
        newBalance: newBalance.toFixed(2),
        message: "Payment confirmed! Wallet credited successfully." 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error confirming payment:", error);
      res.status(500).json({ message: "Failed to confirm payment" });
    }
  });

  // Airtime routes
  app.get('/api/airtime/plans', isAuthenticated, async (req: any, res) => {
    try {
      const plans = await storage.getAirtimePlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching airtime plans:", error);
      res.status(500).json({ message: "Failed to fetch airtime plans" });
    }
  });

  app.post('/api/airtime/purchase', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { network, phoneNumber, amount } = purchaseAirtimeSchema.parse(req.body);

      // Get user and check balance
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Calculate discount (2% for airtime)
      const discount = 2;
      const finalAmount = amount * (100 - discount) / 100;

      const currentBalance = parseFloat(user.walletBalance);
      if (currentBalance < finalAmount) {
        return res.status(400).json({ message: "Insufficient wallet balance" });
      }

      // Deduct from wallet
      const newBalance = currentBalance - finalAmount;
      await storage.updateWalletBalance(userId, newBalance.toFixed(2));

      // Create transaction
      await storage.createTransaction({
        userId,
        type: 'airtime',
        amount: finalAmount.toFixed(2),
        status: 'completed',
        description: `${network} Airtime - ${phoneNumber}`,
        metadata: {
          network,
          phoneNumber,
          originalAmount: amount,
          discount,
          finalAmount
        }
      });

      res.json({ 
        success: true, 
        message: `₦${amount} airtime sent to ${phoneNumber}`,
        newBalance: newBalance.toFixed(2)
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error purchasing airtime:", error);
      res.status(500).json({ message: "Failed to purchase airtime" });
    }
  });

  // Data routes
  app.get('/api/data/plans', isAuthenticated, async (req: any, res) => {
    try {
      const plans = await storage.getDataPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching data plans:", error);
      res.status(500).json({ message: "Failed to fetch data plans" });
    }
  });

  app.post('/api/data/purchase', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { planId, phoneNumber } = purchaseDataSchema.parse(req.body);

      // Get plan details
      const allPlans = await storage.getDataPlans();
      const plan = allPlans.find(p => p.id === planId);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }

      // Get user and check balance
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const price = parseFloat(plan.price);
      const currentBalance = parseFloat(user.walletBalance);
      if (currentBalance < price) {
        return res.status(400).json({ message: "Insufficient wallet balance" });
      }

      // Deduct from wallet
      const newBalance = currentBalance - price;
      await storage.updateWalletBalance(userId, newBalance.toFixed(2));

      // Create transaction
      await storage.createTransaction({
        userId,
        type: 'data',
        amount: price.toFixed(2),
        status: 'completed',
        description: `${plan.network} ${plan.size} ${plan.category} - ${phoneNumber}`,
        metadata: {
          network: plan.network,
          phoneNumber,
          planId: plan.id,
          size: plan.size,
          category: plan.category,
          validity: plan.validity
        }
      });

      res.json({ 
        success: true, 
        message: `${plan.size} data sent to ${phoneNumber}`,
        newBalance: newBalance.toFixed(2)
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error purchasing data:", error);
      res.status(500).json({ message: "Failed to purchase data" });
    }
  });

  // Transaction routes
  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get('/api/transactions/recent', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getRecentTransactions(userId, 5);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching recent transactions:", error);
      res.status(500).json({ message: "Failed to fetch recent transactions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
