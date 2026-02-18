import { z } from "zod";

export const insertLicenseSchema = z.object({
  key: z.string().min(1, "Key is required"),
  customerId: z.string().min(1, "Customer is required"),
  customerName: z.string().optional().default(""),
  productId: z.string().min(1, "Product is required"),
  productName: z.string().optional().default(""),
  status: z.enum(["active", "expired", "revoked", "suspended"]).default("active"),
  createdAt: z.string().min(1),
  expiresAt: z.string().min(1),
});

export const updateLicenseSchema = z.object({
  status: z.enum(["active", "expired", "revoked", "suspended"]).optional(),
  expiresAt: z.string().optional(),
});

export type InsertLicense = z.infer<typeof insertLicenseSchema>;
