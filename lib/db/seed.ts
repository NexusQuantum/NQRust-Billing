import { db } from "./index";
import { products, customers, customerProducts, deals, licenses, apiKeys, users, pricingPlans, subscriptions, invoices, invoiceItems, payments, usageEvents, creditNotes, creditNoteItems, coupons, subscriptionDiscounts, refunds, dunningLog, billingEvents, webhookEndpoints } from "./schema";
import { hashApiKey, getKeyPrefix } from "../api-keys";
import { hashPassword } from "../auth";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  // Clear tables
  await db.execute(sql`TRUNCATE webhook_deliveries, webhook_endpoints, billing_events, dunning_log, refunds, subscription_discounts, coupons, credit_note_items, credit_notes, usage_events, payments, invoice_items, invoices, subscriptions, pricing_plans, sessions, users, api_keys, customer_products, licenses, deals, customers, products CASCADE`);

  // ---- Products ----
  const productRows = [
    { id: "1", name: "Enterprise Plan", productType: "licensed" as const, unitsSold: 42, revenue: 487500, target: 450000, activeLicenses: 38, totalLicenses: 42, change: 15 },
    { id: "2", name: "AI Chat Platform", productType: "saas" as const, revenue: 180200, target: 200000, mau: 45200, dau: 12800, freeUsers: 38000, paidUsers: 7200, churnRate: 3.2, change: 34 },
    { id: "3", name: "Pro Plan", productType: "licensed" as const, unitsSold: 156, revenue: 356200, target: 400000, activeLicenses: 141, totalLicenses: 156, change: 22 },
    { id: "4", name: "AI Chat API", productType: "api" as const, revenue: 95400, target: 110000, apiCalls: 2400000, activeDevelopers: 340, avgLatency: 245, change: 28 },
    { id: "5", name: "Starter Plan", productType: "licensed" as const, unitsSold: 312, revenue: 112800, target: 120000, activeLicenses: 289, totalLicenses: 312, change: 31 },
    { id: "6", name: "Team Plan", productType: "licensed" as const, unitsSold: 67, revenue: 189400, target: 200000, activeLicenses: 59, totalLicenses: 67, change: 8 },
  ];
  await db.insert(products).values(productRows);
  console.log(`  Inserted ${productRows.length} products`);

  // ---- Customers ----
  const customerRows = [
    { id: "1", name: "Acme Corporation", industry: "Technology", tier: "Enterprise", location: "San Francisco, CA", contact: "John Smith", email: "john@acme.com", phone: "+1 (555) 123-4567", totalRevenue: 485000, healthScore: 92, trend: "up" as const, lastContact: "2 days ago", billingEmail: "billing@acme.com", billingAddress: "100 Market Street", billingCity: "San Francisco", billingState: "CA", billingZip: "94105", billingCountry: "US", taxId: "US-123456789", defaultPaymentMethod: "bank_transfer" as const },
    { id: "2", name: "GlobalTech Industries", industry: "Manufacturing", tier: "Enterprise", location: "New York, NY", contact: "Sarah Johnson", email: "sarah@globaltech.com", phone: "+1 (555) 234-5678", totalRevenue: 320000, healthScore: 85, trend: "up" as const, lastContact: "1 week ago", billingEmail: "ap@globaltech.com", billingAddress: "200 Park Avenue", billingCity: "New York", billingState: "NY", billingZip: "10166", billingCountry: "US", defaultPaymentMethod: "manual" as const },
    { id: "3", name: "NovaTech AI", industry: "AI / ML", tier: "Growth", location: "Seattle, WA", contact: "Priya Sharma", email: "priya@novatech.ai", phone: "+1 (555) 789-0123", totalRevenue: 198000, healthScore: 91, trend: "up" as const, lastContact: "Yesterday", billingEmail: "priya@novatech.ai", defaultPaymentMethod: "stripe" as const },
    { id: "4", name: "DataStream Analytics", industry: "Data Services", tier: "Growth", location: "Austin, TX", contact: "Emily Rodriguez", email: "emily@datastream.com", phone: "+1 (555) 456-7890", totalRevenue: 98000, healthScore: 65, trend: "down" as const, lastContact: "2 weeks ago" },
    { id: "5", name: "DevForge Labs", industry: "Developer Tools", tier: "Growth", location: "Portland, OR", contact: "Marcus Tran", email: "marcus@devforge.io", phone: "+1 (555) 321-6543", totalRevenue: 76000, healthScore: 88, trend: "up" as const, lastContact: "3 days ago", billingAddress: "55 NW Couch St", billingCity: "Portland", billingState: "OR", billingZip: "97209", billingCountry: "US", defaultPaymentMethod: "bank_transfer" as const },
    { id: "6", name: "CloudFirst Inc", industry: "Cloud Services", tier: "Enterprise", location: "Denver, CO", contact: "Lisa Wang", email: "lisa@cloudfirst.com", phone: "+1 (555) 678-9012", totalRevenue: 275000, healthScore: 95, trend: "up" as const, lastContact: "Today", billingEmail: "finance@cloudfirst.com", billingAddress: "1600 Stout Street", billingCity: "Denver", billingState: "CO", billingZip: "80202", billingCountry: "US", taxId: "US-987654321", defaultPaymentMethod: "check" as const },
  ];
  await db.insert(customers).values(customerRows);
  console.log(`  Inserted ${customerRows.length} customers`);

  // ---- Customer-Product relations ----
  const cpRows = [
    // Acme Corporation
    { customerId: "1", productId: "1", licenseKeys: ["K9RF-XHWN-3TBP-QM7J", "M3TN-7FWB-RKPD-J2YS", "N5TG-8KRB-FWZJ-P3CM"] },
    { customerId: "1", productId: "2", mau: 2800 },
    // GlobalTech Industries
    { customerId: "2", productId: "1", licenseKeys: ["P6HS-QWZR-4YCM-B8VK", "L8WP-KDFJ-3VRN-Y5BH"] },
    // NovaTech AI
    { customerId: "3", productId: "2", mau: 4200 },
    { customerId: "3", productId: "4", apiCalls: 890000 },
    // DataStream Analytics
    { customerId: "4", productId: "3", licenseKeys: ["W9HF-MVQX-2DKP-R6YN", "G4CN-TBRW-7YHP-Q8MV"] },
    // DevForge Labs
    { customerId: "5", productId: "4", apiCalls: 1200000 },
    // CloudFirst Inc
    { customerId: "6", productId: "3", licenseKeys: ["V4DP-8YKE-NWCR-H6FS", "J7BN-KWTP-3FRS-M2XH"] },
    { customerId: "6", productId: "2", mau: 1500 },
    { customerId: "6", productId: "4", apiCalls: 340000 },
  ];
  await db.insert(customerProducts).values(cpRows);
  console.log(`  Inserted ${cpRows.length} customer-product relations`);

  // ---- Deals ----
  // dealType: "sale" (default), "trial", or "partner"
  const dealRows = [
    // Sales
    { id: "1", customerId: "1", company: "Acme Corporation", contact: "John Smith", email: "john@acme.com", value: 125000, productName: "Enterprise Plan", productType: "licensed" as const, dealType: "sale" as const, date: "2024-01-15", licenseKey: "K9RF-XHWN-3TBP-QM7J", productId: "1" },
    { id: "2", customerId: "3", company: "NovaTech AI", contact: "Priya Sharma", email: "priya@novatech.ai", value: 18000, productName: "AI Chat Platform", productType: "saas" as const, dealType: "sale" as const, date: "2024-01-16", usageMetricLabel: "MAU", usageMetricValue: 4200, productId: "2" },
    { id: "3", company: "TechStart Inc", contact: "Lisa Wong", email: "lisa@techstart.io", value: 89500, productName: "Pro Plan", productType: "licensed" as const, dealType: "sale" as const, date: "2024-01-22", licenseKey: "G4CN-TBRW-7YHP-Q8MV", productId: "3" },
    { id: "4", customerId: "5", company: "DevForge Labs", contact: "Marcus Tran", email: "marcus@devforge.io", value: 32400, productName: "AI Chat API", productType: "api" as const, dealType: "sale" as const, date: "2024-01-20", usageMetricLabel: "calls/mo", usageMetricValue: 890000, productId: "4" },
    { id: "5", company: "GlobalFin Partners", contact: "Robert Davis", email: "rdavis@globalfin.com", value: 245000, productName: "Enterprise Plan", productType: "licensed" as const, dealType: "sale" as const, date: "2024-02-01", licenseKey: "L8WP-KDFJ-3VRN-Y5BH", productId: "1" },
    { id: "6", customerId: "6", company: "CloudFirst Inc", contact: "Lisa Wang", email: "lisa@cloudfirst.com", value: 178000, productName: "Pro Plan", productType: "licensed" as const, dealType: "sale" as const, date: "2024-01-18", licenseKey: "V4DP-8YKE-NWCR-H6FS", productId: "3" },
    { id: "7", company: "StackBridge", contact: "Aiden Brooks", email: "aiden@stackbridge.dev", value: 8400, productName: "AI Chat API", productType: "api" as const, dealType: "sale" as const, date: "2024-01-25", usageMetricLabel: "calls/mo", usageMetricValue: 210000, productId: "4" },
    { id: "8", company: "Lumin Health", contact: "Carla Reyes", email: "carla@luminhealth.com", value: 54000, productName: "AI Chat Platform", productType: "saas" as const, dealType: "sale" as const, date: "2024-02-08", usageMetricLabel: "seats", usageMetricValue: 120, productId: "2" },
    { id: "10", customerId: "2", company: "GlobalTech Industries", contact: "Sarah Johnson", email: "sarah@globaltech.com", value: 203000, productName: "Enterprise Plan", productType: "licensed" as const, dealType: "sale" as const, date: "2024-02-05", licenseKey: "P6HS-QWZR-4YCM-B8VK", productId: "1" },
    // Trials — short free access, licensed products get trial license keys
    { id: "t1", company: "Nexus Technologies", contact: "Raj Patel", email: "raj@nexustech.io", value: 0, productName: "Pro Plan", productType: "licensed" as const, dealType: "trial" as const, date: "2024-02-10", licenseKey: "TR01-NXUS-EVAL-14DY", productId: "3", notes: "14-day evaluation of Pro Plan features" },
    { id: "t2", company: "Bright Systems", contact: "Anna Chen", email: "anna@brightsys.com", value: 0, productName: "Enterprise Plan", productType: "licensed" as const, dealType: "trial" as const, date: "2024-02-12", licenseKey: "TR02-BRGT-EVAL-30DY", productId: "1", notes: "30-day enterprise evaluation, interested in 50+ seats" },
    { id: "t3", company: "Astra Robotics", contact: "Daniel Kim", email: "daniel@astrabot.ai", value: 0, productName: "AI Chat Platform", productType: "saas" as const, dealType: "trial" as const, date: "2024-02-14", productId: "2", notes: "Platform trial for robotics team, 15 users" },
    // Partners — longer free access for strategic partners
    { id: "t4", customerId: "5", company: "DevForge Labs", contact: "Marcus Tran", email: "marcus@devforge.io", value: 0, productName: "Enterprise Plan", productType: "licensed" as const, dealType: "partner" as const, date: "2024-01-10", licenseKey: "PR01-DVFG-PRTN-90DY", productId: "1", notes: "Integration partner — 90-day access for building DevForge x Enterprise connector" },
    { id: "t5", customerId: "3", company: "NovaTech AI", contact: "Priya Sharma", email: "priya@novatech.ai", value: 0, productName: "AI Chat API", productType: "api" as const, dealType: "partner" as const, date: "2024-01-20", productId: "4", notes: "AI research partner — unlimited API access for joint ML project" },
  ];
  await db.insert(deals).values(dealRows);
  console.log(`  Inserted ${dealRows.length} deals`);

  // ---- Licenses ----
  const licenseRows = [
    // Sale licenses
    { key: "K9RF-XHWN-3TBP-QM7J", customerId: "1", customerName: "Acme Corporation", productId: "1", productName: "Enterprise Plan", status: "active" as const, createdAt: "2024-01-15", expiresAt: "2025-01-15" },
    { key: "V4DP-8YKE-NWCR-H6FS", customerId: "6", customerName: "CloudFirst Inc", productId: "3", productName: "Pro Plan", status: "active" as const, createdAt: "2024-01-18", expiresAt: "2025-01-18" },
    { key: "M3TN-7FWB-RKPD-J2YS", customerId: "1", customerName: "Acme Corporation", productId: "1", productName: "Enterprise Plan", status: "active" as const, createdAt: "2024-01-05", expiresAt: "2025-01-05" },
    { key: "P6HS-QWZR-4YCM-B8VK", customerId: "2", customerName: "GlobalTech Industries", productId: "6", productName: "Team Plan", status: "expired" as const, createdAt: "2023-06-10", expiresAt: "2024-06-10" },
    { key: "X2BD-JNFT-9GHR-K5WQ", customerId: "5", customerName: "DevForge Labs", productId: "5", productName: "Starter Plan", status: "active" as const, createdAt: "2024-02-01", expiresAt: "2025-02-01" },
    { key: "R7YK-DCVE-QM3W-H4NP", customerId: "4", customerName: "DataStream Analytics", productId: "3", productName: "Pro Plan", status: "revoked" as const, createdAt: "2023-09-20", expiresAt: "2024-09-20" },
    { key: "N5TG-8KRB-FWZJ-P3CM", customerId: "1", customerName: "Acme Corporation", productId: "1", productName: "Enterprise Plan", status: "active" as const, createdAt: "2024-01-12", expiresAt: "2025-01-12" },
    { key: "W9HF-MVQX-2DKP-R6YN", customerId: "4", customerName: "DataStream Analytics", productId: "3", productName: "Pro Plan", status: "suspended" as const, createdAt: "2024-01-08", expiresAt: "2025-01-08" },
    { key: "G4CN-TBRW-7YHP-Q8MV", customerId: "3", customerName: "NovaTech AI", productId: "3", productName: "Pro Plan", status: "active" as const, createdAt: "2024-01-20", expiresAt: "2025-01-20" },
    { key: "L8WP-KDFJ-3VRN-Y5BH", customerId: "2", customerName: "GlobalTech Industries", productId: "1", productName: "Enterprise Plan", status: "active" as const, createdAt: "2023-11-15", expiresAt: "2024-11-15" },
    // Trial licenses (short expiry)
    { key: "TR01-NXUS-EVAL-14DY", customerName: "Nexus Technologies", productId: "3", productName: "Pro Plan", status: "active" as const, createdAt: "2024-02-10", expiresAt: "2024-02-24" },
    { key: "TR02-BRGT-EVAL-30DY", customerName: "Bright Systems", productId: "1", productName: "Enterprise Plan", status: "active" as const, createdAt: "2024-02-12", expiresAt: "2024-03-13" },
    // Partner licenses (longer expiry)
    { key: "PR01-DVFG-PRTN-90DY", customerId: "5", customerName: "DevForge Labs", productId: "1", productName: "Enterprise Plan", status: "active" as const, createdAt: "2024-01-10", expiresAt: "2024-04-10" },
  ];
  await db.insert(licenses).values(licenseRows);
  console.log(`  Inserted ${licenseRows.length} licenses`);

  // ---- API Keys ----
  const devKey = "pk_live_SEEDKEY_FOR_DEVELOPMENT_ONLY_000000000";
  const apiKeyRows = [
    {
      id: "apikey-1",
      name: "Development Test Key",
      keyHash: hashApiKey(devKey),
      keyPrefix: getKeyPrefix(devKey),
      status: "active" as const,
    },
  ];
  await db.insert(apiKeys).values(apiKeyRows);
  console.log(`  Inserted ${apiKeyRows.length} API keys`);
  console.log(`  Dev API key: ${devKey}`);

  // ---- Users ----
  const adminPassword = await hashPassword("admin123");
  const userRows = [
    {
      id: "admin-1",
      email: "admin@productops.com",
      name: "Admin User",
      passwordHash: adminPassword,
      role: "admin" as const,
    },
  ];
  await db.insert(users).values(userRows);
  console.log(`  Inserted ${userRows.length} users`);
  console.log(`  Admin login: admin@productops.com / admin123`);

  // ---- Pricing Plans ----
  const planRows = [
    { id: "plan-1", productId: "1", name: "Enterprise Monthly", pricingModel: "flat" as const, billingCycle: "monthly" as const, basePrice: 500, trialDays: 30 },
    { id: "plan-2", productId: "3", name: "Pro Plan Yearly", pricingModel: "flat" as const, billingCycle: "yearly" as const, basePrice: 2000, trialDays: 14 },
    { id: "plan-3", productId: "4", name: "API Usage Plan", pricingModel: "usage_based" as const, billingCycle: "monthly" as const, basePrice: 0, unitPrice: 0.001, usageMetricName: "api_calls" },
    { id: "plan-4", productId: "2", name: "SaaS Starter", pricingModel: "per_unit" as const, billingCycle: "monthly" as const, basePrice: 0, unitPrice: 10, usageMetricName: "seats" },
  ];
  await db.insert(pricingPlans).values(planRows);
  console.log(`  Inserted ${planRows.length} pricing plans`);

  // ---- Subscriptions ----
  const subRows = [
    { id: "sub-1", customerId: "1", planId: "plan-1", status: "active" as const, currentPeriodStart: new Date("2026-01-01"), currentPeriodEnd: new Date("2026-02-01"), quantity: 3 },
    { id: "sub-2", customerId: "2", planId: "plan-1", status: "active" as const, currentPeriodStart: new Date("2026-01-15"), currentPeriodEnd: new Date("2026-02-15"), quantity: 2 },
    { id: "sub-3", customerId: "3", planId: "plan-4", status: "active" as const, currentPeriodStart: new Date("2026-01-01"), currentPeriodEnd: new Date("2026-02-01"), quantity: 15 },
    { id: "sub-4", customerId: "5", planId: "plan-3", status: "active" as const, currentPeriodStart: new Date("2026-01-01"), currentPeriodEnd: new Date("2026-02-01"), quantity: 1 },
    { id: "sub-5", customerId: "4", planId: "plan-2", status: "past_due" as const, currentPeriodStart: new Date("2025-01-01"), currentPeriodEnd: new Date("2026-01-01"), quantity: 1 },
  ];
  await db.insert(subscriptions).values(subRows);
  console.log(`  Inserted ${subRows.length} subscriptions`);

  // ---- Invoices ----
  const invoiceRows = [
    { id: "inv-1", invoiceNumber: "INV-2026-0001", customerId: "1", subscriptionId: "sub-1", status: "paid" as const, issuedAt: new Date("2026-01-01"), dueAt: new Date("2026-01-31"), paidAt: new Date("2026-01-15"), subtotal: 1500, tax: 0, total: 1500 },
    { id: "inv-2", invoiceNumber: "INV-2026-0002", customerId: "2", subscriptionId: "sub-2", status: "paid" as const, issuedAt: new Date("2026-01-15"), dueAt: new Date("2026-02-14"), paidAt: new Date("2026-01-28"), subtotal: 1000, tax: 0, total: 1000 },
    { id: "inv-3", invoiceNumber: "INV-2026-0003", customerId: "3", subscriptionId: "sub-3", status: "issued" as const, issuedAt: new Date("2026-02-01"), dueAt: new Date("2026-03-03"), subtotal: 150, tax: 0, total: 150 },
    { id: "inv-4", invoiceNumber: "INV-2026-0004", customerId: "1", subscriptionId: "sub-1", status: "issued" as const, issuedAt: new Date("2026-02-01"), dueAt: new Date("2026-03-03"), subtotal: 1500, tax: 120, total: 1620 },
    { id: "inv-5", invoiceNumber: "INV-2026-0005", customerId: "4", subscriptionId: "sub-5", status: "overdue" as const, issuedAt: new Date("2025-12-01"), dueAt: new Date("2025-12-31"), subtotal: 2000, tax: 0, total: 2000 },
    { id: "inv-6", invoiceNumber: "INV-2026-0006", customerId: "5", subscriptionId: "sub-4", status: "paid" as const, issuedAt: new Date("2026-01-01"), dueAt: new Date("2026-01-31"), paidAt: new Date("2026-01-20"), subtotal: 1200, tax: 0, total: 1200 },
    { id: "inv-7", invoiceNumber: "INV-2025-0001", customerId: "6", status: "paid" as const, issuedAt: new Date("2025-11-01"), dueAt: new Date("2025-11-30"), paidAt: new Date("2025-11-10"), subtotal: 500, tax: 40, total: 540 },
    { id: "inv-8", invoiceNumber: "INV-2026-0007", customerId: "6", status: "draft" as const, subtotal: 0, tax: 0, total: 0 },
  ];
  await db.insert(invoices).values(invoiceRows);
  console.log(`  Inserted ${invoiceRows.length} invoices`);

  // ---- Invoice Items ----
  const itemRows = [
    { invoiceId: "inv-1", description: "Enterprise Monthly × 3 units", quantity: 3, unitPrice: 500, amount: 1500 },
    { invoiceId: "inv-2", description: "Enterprise Monthly × 2 units", quantity: 2, unitPrice: 500, amount: 1000 },
    { invoiceId: "inv-3", description: "SaaS Starter × 15 seats", quantity: 15, unitPrice: 10, amount: 150 },
    { invoiceId: "inv-4", description: "Enterprise Monthly × 3 units", quantity: 3, unitPrice: 500, amount: 1500 },
    { invoiceId: "inv-5", description: "Pro Plan Yearly × 1", quantity: 1, unitPrice: 2000, amount: 2000 },
    { invoiceId: "inv-6", description: "API Usage — 1,200,000 calls @ $0.001", quantity: 1200000, unitPrice: 0.001, amount: 1200 },
    { invoiceId: "inv-7", description: "Custom consulting services", quantity: 1, unitPrice: 500, amount: 500 },
  ];
  await db.insert(invoiceItems).values(itemRows);
  console.log(`  Inserted ${itemRows.length} invoice items`);

  // ---- Payments ----
  const paymentRows = [
    { id: "pay-1", invoiceId: "inv-1", amount: 1500, method: "bank_transfer" as const, reference: "TXN-20260115-001", paidAt: new Date("2026-01-15") },
    { id: "pay-2", invoiceId: "inv-2", amount: 1000, method: "manual" as const, reference: "CHK-4521", paidAt: new Date("2026-01-28"), notes: "Wire transfer received" },
    { id: "pay-3", invoiceId: "inv-6", amount: 1200, method: "bank_transfer" as const, reference: "TXN-20260120-003", paidAt: new Date("2026-01-20") },
    { id: "pay-4", invoiceId: "inv-7", amount: 540, method: "check" as const, reference: "CHK-8812", paidAt: new Date("2025-11-10") },
  ];
  await db.insert(payments).values(paymentRows);
  console.log(`  Inserted ${paymentRows.length} payments`);

  // ---- Usage Events ----
  const usageRows = [];
  // Generate API usage events for sub-4 (DevForge Labs - API plan)
  for (let day = 1; day <= 28; day++) {
    const d = new Date(`2026-01-${String(day).padStart(2, "0")}`);
    usageRows.push({
      subscriptionId: "sub-4",
      metricName: "api_calls",
      value: Math.floor(30000 + Math.random() * 20000),
      timestamp: d,
      idempotencyKey: `devforge-api-2026-01-${String(day).padStart(2, "0")}`,
    });
  }
  // SaaS seat usage for sub-3 (NovaTech - SaaS Starter)
  for (let day = 1; day <= 28; day += 7) {
    usageRows.push({
      subscriptionId: "sub-3",
      metricName: "seats",
      value: 15,
      timestamp: new Date(`2026-01-${String(day).padStart(2, "0")}`),
      idempotencyKey: `novatech-seats-2026-01-${String(day).padStart(2, "0")}`,
    });
  }
  await db.insert(usageEvents).values(usageRows);
  console.log(`  Inserted ${usageRows.length} usage events`);

  // ---- Credit Notes ----
  const creditNoteRows = [
    { id: "cn-1", creditNoteNumber: "CN-2026-0001", invoiceId: "inv-1", customerId: "1", reason: "Billing adjustment — overcharged for January", amount: 500, status: "issued" as const, issuedAt: new Date("2026-01-20") },
    { id: "cn-2", creditNoteNumber: "CN-2026-0002", invoiceId: "inv-7", customerId: "6", reason: "Service downtime credit", amount: 100, status: "issued" as const, issuedAt: new Date("2025-12-01") },
  ];
  await db.insert(creditNotes).values(creditNoteRows);
  console.log(`  Inserted ${creditNoteRows.length} credit notes`);

  const creditNoteItemRows = [
    { creditNoteId: "cn-1", description: "Credit: Enterprise Monthly × 1 unit", quantity: 1, unitPrice: 500, amount: 500 },
    { creditNoteId: "cn-2", description: "Credit: Downtime compensation", quantity: 1, unitPrice: 100, amount: 100 },
  ];
  await db.insert(creditNoteItems).values(creditNoteItemRows);
  console.log(`  Inserted ${creditNoteItemRows.length} credit note items`);

  // ---- Coupons ----
  const couponRows = [
    { id: "coupon-1", code: "SAVE20", name: "20% Off First Invoice", discountType: "percentage" as const, discountValue: 20, maxRedemptions: 50, timesRedeemed: 3, validFrom: new Date("2026-01-01"), validUntil: new Date("2026-12-31"), active: true },
    { id: "coupon-2", code: "FLAT100", name: "$100 Off Any Plan", discountType: "fixed_amount" as const, discountValue: 100, maxRedemptions: 20, timesRedeemed: 1, validFrom: new Date("2026-01-01"), active: true },
    { id: "coupon-3", code: "PARTNER50", name: "Partner 50% Discount", discountType: "percentage" as const, discountValue: 50, validFrom: new Date("2025-06-01"), active: true, appliesTo: ["plan-1", "plan-2"] },
    { id: "coupon-4", code: "EXPIRED10", name: "Expired 10% Off", discountType: "percentage" as const, discountValue: 10, timesRedeemed: 12, validFrom: new Date("2025-01-01"), validUntil: new Date("2025-12-31"), active: false },
  ];
  await db.insert(coupons).values(couponRows);
  console.log(`  Inserted ${couponRows.length} coupons`);

  // ---- Subscription Discounts ----
  const discountRows = [
    { subscriptionId: "sub-1", couponId: "coupon-1", appliedAt: new Date("2026-01-01") },
    { subscriptionId: "sub-3", couponId: "coupon-2", appliedAt: new Date("2026-01-15"), expiresAt: new Date("2026-07-15") },
    { subscriptionId: "sub-2", couponId: "coupon-1", appliedAt: new Date("2026-01-20") },
  ];
  await db.insert(subscriptionDiscounts).values(discountRows);
  console.log(`  Inserted ${discountRows.length} subscription discounts`);

  // ---- Refunds ----
  const refundRows = [
    { id: "ref-1", paymentId: "pay-4", invoiceId: "inv-7", amount: 100, reason: "Partial refund for service downtime", status: "completed" as const, processedAt: new Date("2025-12-05") },
  ];
  await db.insert(refunds).values(refundRows);
  console.log(`  Inserted ${refundRows.length} refunds`);

  // ---- Dunning Log ----
  const dunningRows = [
    { id: "dun-1", invoiceId: "inv-5", subscriptionId: "sub-5", step: "reminder" as const, scheduledAt: new Date("2026-01-03"), executedAt: new Date("2026-01-03"), notes: "Auto-dunning: reminder at 3 days past due" },
    { id: "dun-2", invoiceId: "inv-5", subscriptionId: "sub-5", step: "warning" as const, scheduledAt: new Date("2026-01-07"), executedAt: new Date("2026-01-07"), notes: "Auto-dunning: warning at 7 days past due" },
    { id: "dun-3", invoiceId: "inv-5", subscriptionId: "sub-5", step: "final_notice" as const, scheduledAt: new Date("2026-01-14"), executedAt: new Date("2026-01-14"), notes: "Auto-dunning: final_notice at 14 days past due" },
  ];
  await db.insert(dunningLog).values(dunningRows);
  console.log(`  Inserted ${dunningRows.length} dunning log entries`);

  // ---- Billing Events ----
  const eventRows = [
    { id: "evt-1", eventType: "invoice.issued" as const, resourceType: "invoice", resourceId: "inv-1", customerId: "1", data: { invoiceNumber: "INV-2026-0001", customerName: "Acme Corporation", total: 1500, subject: "Invoice INV-2026-0001 issued" } },
    { id: "evt-2", eventType: "payment.received" as const, resourceType: "payment", resourceId: "pay-1", customerId: "1", data: { invoiceId: "inv-1", amount: 1500, method: "bank_transfer", subject: "Payment of $1,500 received" } },
    { id: "evt-3", eventType: "invoice.paid" as const, resourceType: "invoice", resourceId: "inv-1", customerId: "1", data: { invoiceNumber: "INV-2026-0001", total: 1500, subject: "Invoice INV-2026-0001 paid" } },
    { id: "evt-4", eventType: "invoice.issued" as const, resourceType: "invoice", resourceId: "inv-2", customerId: "2", data: { invoiceNumber: "INV-2026-0002", customerName: "GlobalTech Industries", total: 1000, subject: "Invoice INV-2026-0002 issued" } },
    { id: "evt-5", eventType: "invoice.paid" as const, resourceType: "invoice", resourceId: "inv-2", customerId: "2", data: { invoiceNumber: "INV-2026-0002", total: 1000, subject: "Invoice INV-2026-0002 paid" } },
    { id: "evt-6", eventType: "invoice.overdue" as const, resourceType: "invoice", resourceId: "inv-5", customerId: "4", data: { invoiceNumber: "INV-2026-0005", total: 2000, subject: "Invoice INV-2026-0005 is overdue" } },
    { id: "evt-7", eventType: "dunning.reminder" as const, resourceType: "invoice", resourceId: "inv-5", customerId: "4", data: { invoiceNumber: "INV-2026-0005", daysPastDue: 3, subject: "Payment Reminder: Invoice INV-2026-0005" } },
    { id: "evt-8", eventType: "payment.refunded" as const, resourceType: "payment", resourceId: "pay-4", customerId: "6", data: { amount: 100, reason: "Partial refund for service downtime", subject: "Refund of $100 processed" } },
  ];
  await db.insert(billingEvents).values(eventRows);
  console.log(`  Inserted ${eventRows.length} billing events`);

  // ---- Webhook Endpoints ----
  const webhookRows = [
    { id: "wh-1", url: "https://example.com/webhooks/billing", description: "Main billing webhook", secret: "whsec_example_secret_key_12345", events: ["*"] as string[], status: "active" as const },
    { id: "wh-2", url: "https://slack.example.com/webhook", description: "Slack notifications for payments", secret: "whsec_slack_notification_key_67890", events: ["payment.received", "payment.refunded", "invoice.overdue"] as string[], status: "active" as const },
  ];
  await db.insert(webhookEndpoints).values(webhookRows);
  console.log(`  Inserted ${webhookRows.length} webhook endpoints`);

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
