const MODE =
  process.env.NEXT_PUBLIC_APP_MODE === "rantai" ? "rantai" : "nexus";

const configs = {
  nexus: {
    mode: "nexus" as const,
    name: "NQRust Billing",
    shortName: "NQRust",
    logo: "/nexus/nqr-logo-icon.png",
    logoFull: "/nexus/nqr-logo-full.png",
    favicon16: "/nexus/favicon-16x16.png",
    favicon32: "/nexus/favicon-32x32.png",
    appleTouchIcon: "/nexus/apple-touch-icon.png",
    manifest: "/nexus/site.webmanifest",
    billingEmail: "billing@nqrust.com",
    description:
      "NQRust Billing — Product & License Management Dashboard",
  },
  rantai: {
    mode: "rantai" as const,
    name: "RantAI Billing",
    shortName: "RantAI",
    logo: "/logo/logo-rantai.png",
    logoFull: "/logo/logo-rantai-border.png",
    favicon16: "/logo/favicon-16x16.png",
    favicon32: "/logo/favicon-32x32.png",
    appleTouchIcon: "/logo/apple-touch-icon.png",
    manifest: "/logo/site.webmanifest",
    billingEmail: "billing@rantai.com",
    description:
      "RantAI Billing — Product & License Management Dashboard",
  },
} as const;

export const appConfig = configs[MODE];
