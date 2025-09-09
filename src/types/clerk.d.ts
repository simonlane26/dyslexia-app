// types/clerk.d.ts
import "@clerk/types";

declare module "@clerk/types" {
  interface UserPublicMetadata {
    isPro?: boolean;
    plan?: string | null;
    mode?: string | null;
    schoolTier?: string | null;
  }
  interface UserPrivateMetadata {
    isPro?: boolean;
    proSince?: string;
    stripeCustomerId?: string;
    schoolTier?: string | null;
  }
}

