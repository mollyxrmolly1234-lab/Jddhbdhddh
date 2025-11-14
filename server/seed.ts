import { db } from "./db";
import { airtimePlans, dataPlans } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  // Seed airtime plans
  const airtimePlansData = [
    // MTN
    { network: "MTN", amount: 100, price: "98.00", discount: 2 },
    { network: "MTN", amount: 200, price: "196.00", discount: 2 },
    { network: "MTN", amount: 500, price: "490.00", discount: 2 },
    { network: "MTN", amount: 1000, price: "970.00", discount: 3 },
    { network: "MTN", amount: 2000, price: "1940.00", discount: 3 },
    { network: "MTN", amount: 5000, price: "4800.00", discount: 4 },
    
    // Glo
    { network: "Glo", amount: 100, price: "98.00", discount: 2 },
    { network: "Glo", amount: 200, price: "196.00", discount: 2 },
    { network: "Glo", amount: 500, price: "485.00", discount: 3 },
    { network: "Glo", amount: 1000, price: "960.00", discount: 4 },
    { network: "Glo", amount: 2000, price: "1920.00", discount: 4 },
    { network: "Glo", amount: 5000, price: "4750.00", discount: 5 },
    
    // Airtel
    { network: "Airtel", amount: 100, price: "98.00", discount: 2 },
    { network: "Airtel", amount: 200, price: "196.00", discount: 2 },
    { network: "Airtel", amount: 500, price: "490.00", discount: 2 },
    { network: "Airtel", amount: 1000, price: "970.00", discount: 3 },
    { network: "Airtel", amount: 2000, price: "1940.00", discount: 3 },
    { network: "Airtel", amount: 5000, price: "4850.00", discount: 3 },
    
    // 9mobile
    { network: "9mobile", amount: 100, price: "98.00", discount: 2 },
    { network: "9mobile", amount: 200, price: "196.00", discount: 2 },
    { network: "9mobile", amount: 500, price: "490.00", discount: 2 },
    { network: "9mobile", amount: 1000, price: "970.00", discount: 3 },
    { network: "9mobile", amount: 2000, price: "1940.00", discount: 3 },
    { network: "9mobile", amount: 5000, price: "4850.00", discount: 3 },
  ];

  for (const plan of airtimePlansData) {
    await db.insert(airtimePlans).values(plan);
  }

  console.log("Airtime plans seeded!");

  // Seed data plans
  const dataPlansData = [
    // MTN SME
    { network: "MTN", category: "SME Data", size: "500MB", sizeInMB: 500, price: "120.00", validity: "30 days", discount: 5, isBestValue: 0, isMostPopular: 1 },
    { network: "MTN", category: "SME Data", size: "1GB", sizeInMB: 1024, price: "240.00", validity: "30 days", discount: 5, isBestValue: 1, isMostPopular: 1 },
    { network: "MTN", category: "SME Data", size: "2GB", sizeInMB: 2048, price: "480.00", validity: "30 days", discount: 5, isBestValue: 1, isMostPopular: 0 },
    { network: "MTN", category: "SME Data", size: "3GB", sizeInMB: 3072, price: "720.00", validity: "30 days", discount: 5, isBestValue: 0, isMostPopular: 0 },
    { network: "MTN", category: "SME Data", size: "5GB", sizeInMB: 5120, price: "1200.00", validity: "30 days", discount: 5, isBestValue: 1, isMostPopular: 1 },
    { network: "MTN", category: "SME Data", size: "10GB", sizeInMB: 10240, price: "2400.00", validity: "30 days", discount: 6, isBestValue: 0, isMostPopular: 0 },
    
    // MTN Direct Data
    { network: "MTN", category: "Direct Data", size: "1GB", sizeInMB: 1024, price: "280.00", validity: "7 days", discount: 3, isBestValue: 0, isMostPopular: 0 },
    { network: "MTN", category: "Direct Data", size: "2GB", sizeInMB: 2048, price: "560.00", validity: "30 days", discount: 3, isBestValue: 0, isMostPopular: 0 },
    { network: "MTN", category: "Direct Data", size: "6GB", sizeInMB: 6144, price: "1500.00", validity: "7 days", discount: 4, isBestValue: 0, isMostPopular: 0 },
    { network: "MTN", category: "Direct Data", size: "40GB", sizeInMB: 40960, price: "10000.00", validity: "30 days", discount: 4, isBestValue: 0, isMostPopular: 0 },
    
    // MTN Gifting
    { network: "MTN", category: "Gifting", size: "1.5GB", sizeInMB: 1536, price: "900.00", validity: "30 days", discount: 2, isBestValue: 0, isMostPopular: 0 },
    { network: "MTN", category: "Gifting", size: "3.5GB", sizeInMB: 3584, price: "1800.00", validity: "30 days", discount: 2, isBestValue: 0, isMostPopular: 0 },
    
    // Glo SME
    { network: "Glo", category: "SME Data", size: "1GB", sizeInMB: 1024, price: "200.00", validity: "30 days", discount: 8, isBestValue: 1, isMostPopular: 1 },
    { network: "Glo", category: "SME Data", size: "2GB", sizeInMB: 2048, price: "400.00", validity: "30 days", discount: 8, isBestValue: 1, isMostPopular: 0 },
    { network: "Glo", category: "SME Data", size: "3GB", sizeInMB: 3072, price: "600.00", validity: "30 days", discount: 8, isBestValue: 0, isMostPopular: 0 },
    { network: "Glo", category: "SME Data", size: "5GB", sizeInMB: 5120, price: "1000.00", validity: "30 days", discount: 9, isBestValue: 1, isMostPopular: 1 },
    { network: "Glo", category: "SME Data", size: "10GB", sizeInMB: 10240, price: "2000.00", validity: "30 days", discount: 9, isBestValue: 0, isMostPopular: 0 },
    
    // Glo Gifting
    { network: "Glo", category: "Gifting", size: "1GB", sizeInMB: 1024, price: "250.00", validity: "14 days", discount: 5, isBestValue: 0, isMostPopular: 0 },
    { network: "Glo", category: "Gifting", size: "5GB", sizeInMB: 5120, price: "1250.00", validity: "30 days", discount: 5, isBestValue: 0, isMostPopular: 0 },
    
    // Airtel SME
    { network: "Airtel", category: "SME Data", size: "750MB", sizeInMB: 750, price: "300.00", validity: "14 days", discount: 6, isBestValue: 0, isMostPopular: 0 },
    { network: "Airtel", category: "SME Data", size: "1GB", sizeInMB: 1024, price: "230.00", validity: "30 days", discount: 7, isBestValue: 1, isMostPopular: 1 },
    { network: "Airtel", category: "SME Data", size: "2GB", sizeInMB: 2048, price: "460.00", validity: "30 days", discount: 7, isBestValue: 0, isMostPopular: 0 },
    { network: "Airtel", category: "SME Data", size: "5GB", sizeInMB: 5120, price: "1150.00", validity: "30 days", discount: 7, isBestValue: 1, isMostPopular: 0 },
    { network: "Airtel", category: "SME Data", size: "10GB", sizeInMB: 10240, price: "2300.00", validity: "30 days", discount: 8, isBestValue: 0, isMostPopular: 0 },
    
    // Airtel Corporate Gifting
    { network: "Airtel", category: "Corporate Gifting", size: "100GB", sizeInMB: 102400, price: "20000.00", validity: "30 days", discount: 10, isBestValue: 0, isMostPopular: 0 },
    { network: "Airtel", category: "Corporate Gifting", size: "200GB", sizeInMB: 204800, price: "38000.00", validity: "30 days", discount: 12, isBestValue: 1, isMostPopular: 0 },
    
    // 9mobile SME
    { network: "9mobile", category: "SME Data", size: "500MB", sizeInMB: 500, price: "150.00", validity: "30 days", discount: 5, isBestValue: 0, isMostPopular: 0 },
    { network: "9mobile", category: "SME Data", size: "1.5GB", sizeInMB: 1536, price: "450.00", validity: "30 days", discount: 6, isBestValue: 1, isMostPopular: 1 },
    { network: "9mobile", category: "SME Data", size: "2GB", sizeInMB: 2048, price: "550.00", validity: "30 days", discount: 6, isBestValue: 0, isMostPopular: 0 },
    { network: "9mobile", category: "SME Data", size: "3GB", sizeInMB: 3072, price: "800.00", validity: "30 days", discount: 6, isBestValue: 0, isMostPopular: 0 },
    { network: "9mobile", category: "SME Data", size: "11GB", sizeInMB: 11264, price: "2800.00", validity: "30 days", discount: 7, isBestValue: 0, isMostPopular: 0 },
    
    // 9mobile Direct Data
    { network: "9mobile", category: "Direct Data", size: "1GB", sizeInMB: 1024, price: "290.00", validity: "7 days", discount: 4, isBestValue: 0, isMostPopular: 0 },
    { network: "9mobile", category: "Direct Data", size: "15GB", sizeInMB: 15360, price: "3500.00", validity: "30 days", discount: 5, isBestValue: 0, isMostPopular: 0 },
  ];

  for (const plan of dataPlansData) {
    await db.insert(dataPlans).values(plan);
  }

  console.log("Data plans seeded!");
  console.log("Database seeding completed!");
}

seed().catch(console.error);
