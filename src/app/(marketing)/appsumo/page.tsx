import type { Metadata } from "next";
import { AppSumoRedeemClient } from "./AppSumoRedeemClient";

// Deliberately not indexed — this page shows lifetime-deal pricing
// meant only for AppSumo-referred buyers, not organic/search visitors.
export const metadata: Metadata = {
  title: "Redeem Your AppSumo Code | Dyslexia Write",
  description: "Redeem your Dyslexia Write AppSumo lifetime deal code.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://www.dyslexiawrite.com/appsumo" },
};

export default function AppSumoPage() {
  return <AppSumoRedeemClient />;
}
