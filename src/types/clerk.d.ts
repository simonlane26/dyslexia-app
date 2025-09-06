// types/clerk.d.ts
declare namespace Clerk {
  interface User {
    publicMetadata?: {
      isPro?: boolean;
      subscriptionStatus?: string;
      proSince?: string;
      stripeCustomerId?: string;
    };
  }
}
