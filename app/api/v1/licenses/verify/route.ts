import { db } from "@/lib/db";
import { licenses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { authenticateApiKey } from "@/lib/api-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const auth = await authenticateApiKey(req);
  if (!auth.success) return auth.response;

  // Parse request body
  const body = await req.json().catch(() => null);
  if (!body?.licenseKey || typeof body.licenseKey !== "string") {
    return NextResponse.json(
      { valid: false, error: "invalid_request", message: "Request body must include 'licenseKey' string" },
      { status: 400 },
    );
  }

  const licenseKey = body.licenseKey.trim().toUpperCase();

  // Look up the license
  const [license] = await db.select().from(licenses).where(eq(licenses.key, licenseKey));

  if (!license) {
    return NextResponse.json({ valid: false, error: "not_found", message: "License key not found" });
  }

  // Check status
  if (license.status !== "active") {
    return NextResponse.json({
      valid: false,
      error: "license_inactive",
      status: license.status,
      message: `License is ${license.status}`,
    });
  }

  // Check expiration
  const now = new Date();
  const expiresAt = new Date(license.expiresAt);
  if (expiresAt <= now) {
    return NextResponse.json({
      valid: false,
      error: "license_expired",
      status: "expired",
      expiresAt: license.expiresAt,
      message: "License has expired",
    });
  }

  // Valid license
  return NextResponse.json({
    valid: true,
    license: {
      key: license.key,
      status: license.status,
      product: license.productName,
      productId: license.productId,
      customer: license.customerName,
      customerId: license.customerId,
      createdAt: license.createdAt,
      expiresAt: license.expiresAt,
    },
  });
}
