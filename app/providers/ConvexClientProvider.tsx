"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import { ReactNode } from "react";

// Determine which Convex deployment to use based on environment
const convexUrl = process.env.NODE_ENV === 'production' 
  ? process.env.NEXT_PUBLIC_CONVEX_URL_PROD || 'https://laudable-hare-856.convex.cloud'
  : process.env.NEXT_PUBLIC_CONVEX_URL_DEV || 'https://youthful-albatross-854.convex.cloud';

const convex = new ConvexReactClient(convexUrl);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}