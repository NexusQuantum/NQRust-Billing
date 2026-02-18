/**
 * License Key Utility
 * Generates UUID-style license keys in XXXX-XXXX-XXXX-XXXX format
 */

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed ambiguous chars: 0, O, I, 1

export function generateLicenseKey(): string {
  const segments: string[] = [];
  for (let s = 0; s < 4; s++) {
    let segment = "";
    for (let c = 0; c < 4; c++) {
      segment += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
    segments.push(segment);
  }
  return segments.join("-");
}

export type LicenseStatus = "active" | "expired" | "revoked" | "suspended";

export interface License {
  key: string;
  customer: string;
  product: string;
  status: LicenseStatus;
  createdAt: string;
  expiresAt: string;
}

export function getStatusColor(status: LicenseStatus): string {
  switch (status) {
    case "active":
      return "bg-emerald-500/10 text-emerald-500";
    case "expired":
      return "bg-amber-500/10 text-amber-500";
    case "revoked":
      return "bg-red-500/10 text-red-500";
    case "suspended":
      return "bg-orange-500/10 text-orange-500";
  }
}
